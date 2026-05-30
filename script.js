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

// Logic for handling new user registration (Updated with Cache Fix)
function handleRegister(event) {
    event.preventDefault();

    let regFullName = document.getElementById("reg-fullname").value.trim();
    let regUser = document.getElementById("reg-username").value.trim();
    let regEmail = document.getElementById("reg-email").value.trim();
    let regPass = document.getElementById("reg-password").value.trim();

    let usersList = JSON.parse(localStorage.getItem("registeredUsers")) || [];

    let userExists = usersList.find(user => user.username.toLowerCase() === regUser.toLowerCase());
    if (userExists) {
        alert("❌ This username already exists! Please choose another one.");
        return;
    }

    let newUser = {
        fullName: regFullName,
        username: regUser,
        email: regEmail,
        password: regPass
    };
    usersList.push(newUser);

    localStorage.setItem("registeredUsers", JSON.stringify(usersList));

    alert("🎉 Registration successful! Now sign in.");
    toggleForms('login');
}

// Login handling logic (Updated with GitHub Cache Fix)
function handleLogin(event) {
    event.preventDefault();
    
    let userInput = document.getElementById("login-username").value.trim();
    let passInput = document.getElementById("login-password").value.trim();

    let usersList = JSON.parse(localStorage.getItem("registeredUsers")) || [];

    let validUser = usersList.find(user => 
        user.username.toLowerCase() === userInput.toLowerCase() && 
        user.password === passInput
    );

    if (validUser) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", validUser.fullName);
        alert(`Welcome ${validUser.fullName}! Login successful`);
        
        window.location.replace("index.html"); 
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

    let cartCountElements = document.querySelectorAll("#cart-count, #cart-count-mobile, .cart-count-class");
    if (cartCountElements.length === 0) return;

    let currentCart = JSON.parse(localStorage.getItem("cart"));
    
    let totalItems = 0;
    // Safety check: Counts only if the cart exists.
    if (currentCart && Array.isArray(currentCart)) {
        currentCart.forEach(item => {
            totalItems += (parseInt(item.quantity) || 1);
        });
    }
    
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

    if (isLoggedIn === "true" && currentUser && welcomeLi && usernameSpan) {
        usernameSpan.innerText = currentUser; 
        welcomeLi.style.display = "inline-block"; 
    }
}

displayWelcomeMessage();



// 12. PLACE ORDER HANDLER (FIX FOR REFRESH PROBLEM)


const checkoutFormElement = document.getElementById("checkout-form") || document.getElementById("place-order-btn");

if (checkoutFormElement) {
    
    const eventType = checkoutFormElement.tagName === "FORM" ? "submit" : "click";

    checkoutFormElement.addEventListener(eventType, function(e) {
        e.preventDefault(); 

        let finalCart = JSON.parse(localStorage.getItem("cart")) || [];
        if (finalCart.length === 0) {
            alert("❌ Your cart is empty! You cannot place an order.");
            return;
        }

        alert("🎉 TREND ARCADE: Your order has been placed successfully! Thank you for shopping.");

        localStorage.removeItem("cart");
        localStorage.removeItem("finalDiscountedTotal");

        if (typeof updateCartIconCount === "function") {
            updateCartIconCount();
        }

        window.location.href = "index.html";
    });
}