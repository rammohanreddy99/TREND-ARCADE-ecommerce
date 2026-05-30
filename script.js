// 0. LOGIN, REGISTER & AUTHENTICATION GUARD

const currentPage = window.location.pathname;
const isLoggedIn = localStorage.getItem("isLoggedIn");

// Prevent accessing inner pages without logging in

if (!isLoggedIn && !currentPage.includes("login.html")) {
    window.location.href = "login.html";
}

if (isLoggedIn && currentPage.includes("login.html")) {
    window.location.href = "index.html";
}

// Logic for switching between forms (Login ↔ Register)
function toggleForms(formType) {
    let loginForm = document.getElementById("login-form");
    let registerForm = document.getElementById("register-form");
    
    if (!loginForm || !registerForm) return;

    if (formType === 'register') {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
    } else {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
    }
}

// Logic for handling new user registration
function handleRegister(event) {
    event.preventDefault();

    let regFullName = document.getElementById("reg-fullname").value.trim();
    let regUser = document.getElementById("reg-username").value.trim();
    let regEmail = document.getElementById("reg-email").value.trim();
    let regPass = document.getElementById("reg-password").value.trim();

    // Fetching the list of already registered users
    let usersList = JSON.parse(localStorage.getItem("registeredUsers")) || [];

    // Checking if the username is already taken
    let userExists = usersList.find(user => user.username.toLowerCase() === regUser.toLowerCase());
    if (userExists) {
        alert("❌ ఈ యూజర్ నేమ్ ఆల్రెడీ ఉంది! వేరేది ఎంచుకోండి.");
        return;
    }

    // Creating a new user object and adding it to the list
    let newUser = {
        fullName: regFullName,
        username: regUser,
        email: regEmail,
        password: regPass
    };
    usersList.push(newUser);

    // Updating the local storage
    localStorage.setItem("registeredUsers", JSON.stringify(usersList));

    alert("Registration successful! Now sign in");
    toggleForms('login'); // Redirecting to the login screen after registration
}

// Login handling logic (matches with registered users)
function handleLogin(event) {
    event.preventDefault();
    
    let userInput = document.getElementById("login-username").value.trim();
    let passInput = document.getElementById("login-password").value.trim();

    // Fetching registered users from local storage
    let usersList = JSON.parse(localStorage.getItem("registeredUsers")) || [];

    // Checking if the username and password match correctly
    let validUser = usersList.find(user => user.username === userInput && user.password === passInput);

    if (validUser) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", validUser.fullName); // Storing the currently logged-in user’s name
        alert(`Welcome ${validUser.fullName}! Login successful`);
        window.location.href = "index.html";
    } else {
        alert("❌ Invalid username or password! (If not registered, please sign up first.)");
    }
}

// Logout function
function handleLogout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}


// 1. NAVBAR MOBILE TOGGLE LOGIC

const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    });
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    });
}



// 2. LIVE CART ICON COUNTER FUNCTION

function updateCartIconCount() {
    // getElementById కి బదులు querySelectorAll వాడి డెస్క్‌టాప్, మొబైల్ కౌంటర్స్ రెండింటినీ సెలెక్ట్ చేస్తున్నాం
    let cartCountElements = document.querySelectorAll(".cart-count-class");
    if (cartCountElements.length === 0) return;

    let currentCart = JSON.parse(localStorage.getItem("cart"));
    
    let totalItems = 0;
    // Safety check: ఒకవేళ కార్ట్ ఉంటేనే కౌంట్ లెక్కపెడుతుంది
    if (currentCart && Array.isArray(currentCart)) {
        currentCart.forEach(item => {
            totalItems += (parseInt(item.quantity) || 1);
        });
    }
    
    // లూప్ ద్వారా డెస్క్‌టాప్ మరియు మొబైల్ ఐకాన్స్ రెండింటిలోనూ నెంబర్ అప్‌డేట్ అవుతుంది
    cartCountElements.forEach(elem => {
        elem.innerText = totalItems;
    });
}

// Runs when the page loads for the first time
updateCartIconCount();



// 3. ADD TO CART LOGIC (SHOP & INDEX PAGES)

document.querySelectorAll(".add-cart").forEach((btn, index) => {
    btn.addEventListener("click", (e) => {
        e.preventDefault(); // Prevents the page from jumping to the top due to the anchor tag
        e.stopPropagation(); // This prevents the sproduct page from opening
        
        let cart = JSON.parse(localStorage.getItem("cart"));
        if (!cart || !Array.isArray(cart)) {
            cart = [];
        }

        let nameElement = document.querySelectorAll(".pro h5")[index];
        let priceElement = document.querySelectorAll(".pro h4")[index];

        if (nameElement && priceElement) {
            let productName = nameElement.innerText;
            let productPrice = priceElement.innerText;

            // Checking whether this product is already in the cart
            let existingProduct = cart.find(item => item.id === index);

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                let product = {
                    id: index,
                    name: productName,
                    price: productPrice,
                    image: `img/products/f${index + 1}.jpg`, 
                    quantity: 1
                };
                cart.push(product);
            }

            localStorage.setItem("cart", JSON.stringify(cart));
            alert("Added to cart 🛒");
            updateCartIconCount(); // Updating the live count
        }
    });
});



// 4. CART PAGE ITEMS DISPLAY & TOTALS LOGIC

let cartItems = JSON.parse(localStorage.getItem("cart"));
if (!cartItems || !Array.isArray(cartItems)) {
    cartItems = [];
}

let cartTable = document.getElementById("cart-items");
let grandTotal = 0; 

if (cartTable) {
    cartTable.innerHTML = ""; 

    if (cartItems.length === 0) {
        cartTable.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; font-weight: bold;">Your cart is empty!</td></tr>`;
    } else {
        cartItems.forEach((item, index) => {
            let price = parseFloat(item.price.toString().replace('$', '').trim()) || 0;
            let quantity = parseInt(item.quantity) || 1;
            let rowSubtotal = price * quantity;
            
            grandTotal += rowSubtotal; 

            let row = `
                <tr>
                    <td><a href="#" onclick="removeItem(${index})"><i class="bi bi-x-circle" style="color: red;"></i></a></td>
                    <td><img src="img/products/f${item.id + 1}.jpg" alt="${item.name}" onerror="this.src='img/products/f1.jpg'"></td>
                    <td>${item.name}</td>
                    <td>$${price.toFixed(2)}</td>
                    <td>
                        <input type="number" value="${quantity}" min="1" 
                               onchange="updateQuantity(${index}, this.value)" 
                               style="width: 60px; text-align: center;">
                    </td>
                    <td>$${rowSubtotal.toFixed(2)}</td>
                </tr>
            `;
            
            cartTable.innerHTML += row;
        });
    }
}

// Saving the grand total in the global window (for coupon use)
window.currentGrandTotal = grandTotal; 

let subtotalElem = document.getElementById("cart-subtotal-val");
let totalElem = document.getElementById("cart-total-val");

if (subtotalElem && totalElem) {
    subtotalElem.innerText = `$ ${grandTotal.toFixed(2)}`;
    totalElem.innerText = `$ ${grandTotal.toFixed(2)}`; 
}



// 5. QUANTITY UPDATE & REMOVE FUNCTIONS

function updateQuantity(index, newQty) {
    if (newQty < 1) return;
    
    let localCart = JSON.parse(localStorage.getItem("cart")) || [];
    if (localCart[index]) {
        localCart[index].quantity = parseInt(newQty);
        localStorage.setItem("cart", JSON.stringify(localCart));
        
        // Remove the old coupon discount when the quantity changes (to reapply it again)
        localStorage.removeItem("finalDiscountedTotal");
        window.location.reload(); 
    }
}

function removeItem(index) {
    let localCart = JSON.parse(localStorage.getItem("cart")) || [];
    localCart.splice(index, 1); // Removing the item
    
    localStorage.setItem("cart", JSON.stringify(localCart)); 
    // [FIX] Reset the coupon discount amount when an item is deleted
    localStorage.removeItem("finalDiscountedTotal"); 
    window.location.reload(); 
}



// 6. CHECKOUT PAGE FLOW LOGIC (COUPON SYNC FIX)

function goToCheckout() {
    let currentCart = JSON.parse(localStorage.getItem("cart")) || [];
    if (currentCart.length === 0) {
        alert("Your cart is empty! Please add some products. 🛒");
        return;
    }

    // If the user clicks checkout directly without applying a coupon, we save the normal total
    let hasDiscount = localStorage.getItem("finalDiscountedTotal");
    if (!hasDiscount || hasDiscount === "0.00") {
        let grandTotal = 0;
        currentCart.forEach(item => {
            let priceNum = parseFloat(item.price.toString().replace("$", "").trim()) || 0;
            grandTotal += priceNum * (parseInt(item.quantity) || 1);
        });
        localStorage.setItem("finalDiscountedTotal", grandTotal.toFixed(2));
    }

    window.location.href = "checkout.html";
}



// 7. AUTOMATIC PRODUCT CLICK LOGIC (FOR SHOP & INDEX)

document.querySelectorAll(".pro").forEach((productBox, index) => {
    productBox.addEventListener("click", (e) => {
        if (e.target.classList.contains('cart') || e.target.closest('.add-cart') || e.target.closest('a')) {
            return; 
        }

        let nameElement = productBox.querySelector("h5");
        let priceElement = productBox.querySelector("h4");
        let imgElement = productBox.querySelector("img");

        if (nameElement && priceElement && imgElement) {
            let productDetails = {
                id: index,
                name: nameElement.innerText,
                price: priceElement.innerText,
                image: imgElement.getAttribute("src")
            };

            localStorage.setItem("selectedProduct", JSON.stringify(productDetails));
            window.location.href = "sproduct.html";
        }
    });
});



// 8. SPRODUCT PAGE LIVE DATA LOADING LOGIC (FIXED QUANTITY)

let selectedProduct = JSON.parse(localStorage.getItem("selectedProduct"));

if (document.getElementById("sproduct-name") && selectedProduct) {
    
    let mainImgElem = document.getElementById("MainImg");
    
    if (mainImgElem) {
        mainImgElem.src = selectedProduct.image;
    }
    
    document.getElementById("sproduct-name").innerText = selectedProduct.name;
    document.getElementById("sproduct-price").innerText = selectedProduct.price;

    let smallImgs = document.getElementsByClassName("small-img");
    if (smallImgs && smallImgs.length > 0) {
        smallImgs[0].src = selectedProduct.image;
        
        let basePath = selectedProduct.image.substring(0, selectedProduct.image.lastIndexOf('/') + 1);
        let imgType = selectedProduct.image.includes('/n') ? 'n' : 'f';
        
        for(let i=0; i<smallImgs.length; i++) {
            smallImgs[i].src = `${basePath}${imgType}${i + 1}.jpg`; 
            
            smallImgs[i].onclick = function() {
                mainImgElem.src = smallImgs[i].src;
            }
        }
    }

    let sproductAddBtn = document.getElementById("sproduct-add-btn");
    if (sproductAddBtn) {
        let newBtn = sproductAddBtn.cloneNode(true);
        sproductAddBtn.parentNode.replaceChild(newBtn, sproductAddBtn);
        
        newBtn.addEventListener("click", () => {
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            let qtyInput = document.getElementById("sproduct-qty");
            let qty = qtyInput ? parseInt(qtyInput.value) : 1;
            
            if (isNaN(qty) || qty < 1) {
                qty = 1;
            }

            let existingProduct = cart.find(item => item.id === selectedProduct.id);

            if (existingProduct) {
                existingProduct.quantity += qty;
            } else {
                let product = {
                    id: selectedProduct.id,
                    name: selectedProduct.name,
                    price: selectedProduct.price,
                    image: selectedProduct.image,
                    quantity: qty
                };
                cart.push(product);
            }

            localStorage.setItem("cart", JSON.stringify(cart));
            alert(`Added ${qty} item(s) to cart 🛒`);
            updateCartIconCount(); 
        });
    }
}



// 9. COUPON CODE LOGIC (CHECKOUT FIX)

let isCouponApplied = false;

function applyCoupon() {
    let couponInput = document.getElementById("coupon-code");
    let totalElem = document.getElementById("cart-total-val");
    
    if (!couponInput || !totalElem) return;
    
    let code = couponInput.value.trim().toUpperCase();
    
    if (!window.currentGrandTotal || window.currentGrandTotal === 0) {
        alert("You need items in your cart to apply a coupon! 🛒");
        return;
    }

    if (isCouponApplied) {
        alert("A coupon has already been applied! ⚠️");
        return;
    }

    let finalAmount = window.currentGrandTotal;

    if (code === "WELCOME20") {
        let discount = window.currentGrandTotal * 0.20;
        finalAmount = window.currentGrandTotal - discount;
        isCouponApplied = true;
        alert("🎉 The 'WELCOME20' coupon has been successfully applied! You got a 20% discount. 💰");
    } 
    else if (code === "CARA10") {
        let discount = window.currentGrandTotal * 0.10;
        finalAmount = window.currentGrandTotal - discount;
        isCouponApplied = true;
        alert("🎉 The 'CARA10' coupon has been successfully applied! You got a 10% discount. 💰");
    } 
    else if (code === "") {
        alert("Please enter a coupon code! ⌨️");
        return;
    } 
    else {
        alert("Invalid coupon code! Please enter a valid code. ❌");
        return;
    }

    totalElem.innerText = `$ ${finalAmount.toFixed(2)}`;
    
    // Saving the final amount in local storage
    localStorage.setItem("finalDiscountedTotal", finalAmount.toFixed(2));
}



// 10. AUTOMATIC CHECKOUT DISPLAY ON PAGE LOAD

window.addEventListener("load", () => {
    // Checking whether the browser is currently on the checkout.html page
    if (window.location.pathname.includes("checkout.html") || document.getElementById("checkout-total-val")) {
        
        let finalCheckoutTotal = localStorage.getItem("finalDiscountedTotal");
        let checkoutCart = JSON.parse(localStorage.getItem("cart")) || [];

        // If the cart is empty, it displays 0 on the checkout page
        if (checkoutCart.length === 0) {
            finalCheckoutTotal = "0.00";
        }
        // If there is no coupon amount, it immediately calculates the normal cart total
        else if (!finalCheckoutTotal || finalCheckoutTotal === "0.00") {
            let gTotal = 0;
            checkoutCart.forEach(item => {
                let priceNum = parseFloat(item.price.toString().replace("$", "").trim()) || 0;
                gTotal += priceNum * (parseInt(item.quantity) || 1);
            });
            finalCheckoutTotal = gTotal.toFixed(2);
        }

        // Passing the amount to the element with ID 'checkout-total-val' in checkout.html
        let checkoutTotalElem = document.getElementById("checkout-total-val"); 
        if (checkoutTotalElem) {
            checkoutTotalElem.innerText = `$ ${finalCheckoutTotal}`;
        }
    }
});



// 11. DISPLAY LOGGED IN USERNAME IN NAVBAR

function displayWelcomeMessage() {
    let isLoggedIn = localStorage.getItem("isLoggedIn");
    let currentUser = localStorage.getItem("currentUser");
    
    let welcomeLi = document.getElementById("user-welcome-li");
    let usernameSpan = document.getElementById("welcome-username");

    // యూజర్ లాగిన్ అయి ఉంటే మరియు పేరు మెమరీలో ఉంటే..
    if (isLoggedIn === "true" && currentUser && welcomeLi && usernameSpan) {
        usernameSpan.innerText = currentUser; // డమ్మీ 'User' ప్లేస్ లో ఒరిజినల్ పేరు పెడుతుంది
        welcomeLi.style.display = "inline-block"; // దాచిన టెక్స్ట్ ని స్క్రీన్ పై చూపిస్తుంది
    }
}

// పేజీ లోడ్ అవ్వగానే ఈ ఫంక్షన్ ఆటోమేటిక్ గా రన్ అవుతుంది
displayWelcomeMessage();



// 12. PLACE ORDER HANDLER (FIX FOR REFRESH PROBLEM)


// మీ checkout.html లో ఉన్న <form> ట్యాగ్‌కు id="checkout-form" అని ఉందో లేదో చెక్ చేసుకోండి
// ఒకవేళ బటన్ కి మాత్రమే ID ఉంటే.. document.getElementById("place-order-btn") అని మార్చుకోవచ్చు
const checkoutFormElement = document.getElementById("checkout-form") || document.getElementById("place-order-btn");

if (checkoutFormElement) {
    // అది ఫామ్ అయితే 'submit' కి, కేవలం బటన్ అయితే 'click' కి ఈవెంట్ రన్ అవుతుంది
    const eventType = checkoutFormElement.tagName === "FORM" ? "submit" : "click";

    checkoutFormElement.addEventListener(eventType, function(e) {
        // 1. 🔥 పేజీ ఆటోమేటిక్‌గా రీఫ్రెష్ అయిపోకుండా ఇక్కడే గట్టిగా ఆపుతుంది!
        e.preventDefault(); 

        let finalCart = JSON.parse(localStorage.getItem("cart")) || [];
        if (finalCart.length === 0) {
            alert("❌ మీ కార్ట్ ఖాళీగా ఉంది! ఆర్డర్ ప్లేస్ చేయలేరు.");
            return;
        }

        // 2. యూజర్‌కి సక్సెస్ మెసేజ్ చూపిస్తుంది
        alert("🎉 TREND ARCADE: మీ ఆర్డర్ సక్సెస్‌ఫుల్‌గా ప్లేస్ అయింది! షాపింగ్ చేసినందుకు ధన్యవాదాలు.");

        // 3. ఆర్డర్ అయిపోయింది కాబట్టి లోకల్ స్టోరేజ్ నుండి కార్ట్ డేటాను క్లియర్ చేస్తుంది
        localStorage.removeItem("cart");
        localStorage.removeItem("finalDiscountedTotal");

        // 4. Navbar లో ఉన్న కార్ట్ కౌంటర్‌ని మళ్ళీ 0 కి అప్‌డేట్ చేస్తుంది
        if (typeof updateCartIconCount === "function") {
            updateCartIconCount();
        }

        // 5. ఆర్డర్ కన్ఫర్మ్ అయ్యాక యూజర్‌ని హోమ్ పేజీకి పంపుతుంది
        window.location.href = "index.html";
    });
}