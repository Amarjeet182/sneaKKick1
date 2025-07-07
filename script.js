// script.js

let cart = JSON.parse(localStorage.getItem("sneakCart")) || [];

function saveCart() {
  localStorage.setItem("sneakCart", JSON.stringify(cart));
}

// Helper to update the cart count on the navbar
function updateCartCount() {
  const cartCountSpan = document.getElementById("cart-count");
  if (cartCountSpan) {
    cartCountSpan.textContent = cart.length.toString();
  }
}

// INDEX PAGE
function initIndex() {
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", () => {
      const name = button.getAttribute("data-name");
      const price = parseFloat(button.getAttribute("data-price"));

      cart.push({ name, price });
      saveCart();

      alert(`${name} added to cart!`);
      updateCartCount();

      // --- Adobe Analytics: Send Add to Cart event ---
      if (typeof s !== "undefined" && typeof digitalData !== "undefined") {
        // Populate Data Layer
        digitalData.product = [{
            productInfo: { productName: name, price: price },
            category: { primaryCategory: 'Footwear' }
        }];

        s.products = "%;" + name + ";1;" + price;
        s.events = "event2,event6=" + price + ",event8=1";
        s.eVar2 = name;
        s.eVar3 = price;
        s.tl(true, 'o', 'Add to Cart - ' + name);
      }
    });
  });

  updateCartCount();
}

// CART PAGE
function initCart() {
  const cartList = document.getElementById("cart-list");
  const totalSpan = document.getElementById("total");
  const checkoutBtn = document.getElementById("checkout-btn");

  function updateCartDisplay() {
    cartList.innerHTML = "";
    let sum = 0;

    if (cart.length === 0) {
      cartList.innerHTML = "<p>Your cart is empty.</p>";
    } else {
      cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "cart-item";
        li.innerHTML = `
          ${item.name} - ₹${item.price.toFixed(2)}
          <button class="remove-btn" data-index="${index}">Remove</button>
        `;
        cartList.appendChild(li);
        sum += item.price;
      });
    }

    totalSpan.textContent = `₹${sum.toFixed(2)}`;
  }

  // Initial display and Adobe Analytics event on cart page load
  updateCartDisplay();

  // --- Adobe Analytics: Send Page View event for Cart Page ---
  if (typeof s !== "undefined" && typeof digitalData !== "undefined") {
    const initialCartTotal = cart.reduce((acc, item) => acc + item.price, 0);
    
    // Populate Data Layer
    digitalData.cart.price = { basePrice: initialCartTotal, currency: 'INR' };
    digitalData.cart.item = cart.map(item => ({
        productInfo: { productName: item.name, price: item.price },
        quantity: 1
    }));

    s.pageName = document.title;
    s.prop3 = cart.length;
    s.prop4 = initialCartTotal;
    s.events = "event5";
    s.t();
  }


  // Event listener for remove buttons
  cartList.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const index = parseInt(e.target.getAttribute("data-index"));
      const removedItem = cart[index];

      cart.splice(index, 1);
      saveCart();
      updateCartDisplay();

      // --- Adobe Analytics: Send Remove from Cart event ---
      if (typeof s !== "undefined" && typeof digitalData !== "undefined") {
        // Populate Data Layer
        digitalData.product = [{
            productInfo: { productName: removedItem.name, price: removedItem.price },
            category: { primaryCategory: 'Footwear' }
        }];

        s.products = "%;" + removedItem.name + ";-1;" + removedItem.price;
        s.events = "event3,event7=" + removedItem.price + ",event9=1";
        s.eVar2 = removedItem.name;
        s.eVar3 = removedItem.price;
        s.tl(true, 'o', 'Remove from Cart - ' + removedItem.name);
      }
    }
  });

  // Event listener for checkout button
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length > 0) {
        // --- Adobe Analytics: Send Begin Checkout event ---
        if (typeof s !== "undefined" && typeof digitalData !== "undefined") {
          const finalCartTotal = cart.reduce((acc, item) => acc + item.price, 0);
          const productListString = cart.map(item => `%;${item.name};1;${item.price}`).join('');

          // Populate Data Layer
          digitalData.cart.price = { basePrice: finalCartTotal, currency: 'INR' };
          digitalData.cart.item = cart.map(item => ({
              productInfo: { productName: item.name, price: item.price },
              quantity: 1
          }));

          s.products = productListString.substring(1);
          s.total = finalCartTotal;
          s.currencyCode = "INR";
          s.events = "event4";
          s.tl(true, 'o', 'Begin Checkout');
        }

        alert("Proceeding to checkout!");
        cart = [];
        saveCart();
        updateCartDisplay();
      } else {
        alert("Your cart is empty. Please add items before checking out.");
      }
    });
  }
}

// CONTACT PAGE
function initContactForm() {
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form data
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const inquiryCategory = document.getElementById("inquiry_category").value;
      const message = document.getElementById("message").value;
      const age = document.getElementById("age").value;
      const rating = document.getElementById("rating").value;

      // --- Adobe Analytics: Send Form Submit event ---
      if (typeof s !== "undefined" && typeof digitalData !== "undefined") {
        // Populate Data Layer
        digitalData.form = {
            formInfo: { formName: 'Contact Us', formSubmit: true },
            attributes: { inquiryCategory: inquiryCategory, messageLength: message.length }
        };
        digitalData.user = {
            userInfo: {
                profile: { age: age, rating: rating }
            }
        };

        s.prop5 = "Contact Us Form";
        s.eVar5 = inquiryCategory;
        s.eVar6 = parseFloat(rating);
        s.eVar7 = name;
        s.eVar8 = email;
        s.eVar9 = message.length;
        s.events = "event10";
        s.tl(true, 'o', 'Contact Form Submitted - ' + inquiryCategory);
      }

      alert("Thank you for your message! We will get back to you soon.");
      contactForm.reset();
    });
  }
}

// Initializations based on current page
window.onload = () => {
  if (document.querySelectorAll(".add-to-cart").length > 0) {
    initIndex();
  } else if (document.getElementById("cart-list")) {
    initCart();
  } else if (document.getElementById("contactForm")) {
    initContactForm();
  }
  updateCartCount();
};
