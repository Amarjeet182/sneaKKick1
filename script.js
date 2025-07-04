// script.js

// Initialize cart from local storage or as an empty array
let cart = JSON.parse(localStorage.getItem("sneakCart")) || [];

/**
 * Saves the current cart array to local storage.
 */
function saveCart() {
  localStorage.setItem("sneakCart", JSON.stringify(cart));
}

/**
 * Updates the cart count displayed on the navigation bar.
 */
function updateCartCount() {
  const cartCountSpan = document.getElementById("cart-count");
  if (cartCountSpan) {
    cartCountSpan.textContent = cart.length.toString();
  }
}

/**
 * Displays a custom message to the user instead of using alert().
 * @param {string} message - The message to display.
 * @param {boolean} isSuccess - True for success message, false for error/warning.
 */
function showCustomMessage(message, isSuccess = true) {
  let messageBox = document.getElementById('custom-message-box');
  if (!messageBox) {
    messageBox = document.createElement('div');
    messageBox.id = 'custom-message-box';
    messageBox.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
      transform: translateY(-20px);
    `;
    document.body.appendChild(messageBox);
  }

  messageBox.textContent = message;
  messageBox.style.backgroundColor = isSuccess ? '#4CAF50' : '#f44336'; // Green for success, Red for error
  messageBox.style.opacity = '1';
  messageBox.style.transform = 'translateY(0)';

  // Hide the message after 3 seconds
  setTimeout(() => {
    messageBox.style.opacity = '0';
    messageBox.style.transform = 'translateY(-20px)';
  }, 3000);
}


// INDEX PAGE - Initializes event listeners for "Add to Cart" buttons
function initIndex() {
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", () => {
      const name = button.getAttribute("data-name");
      const price = parseFloat(button.getAttribute("data-price"));

      cart.push({ name, price });
      saveCart();

      // Replace alert with custom message box
      showCustomMessage(`${name} added to cart!`);
      updateCartCount(); // Optional: live count on navbar

      // --- Use DataLayer.push for GA4 add_to_cart event ---
      // This pushes a custom event 'add_to_cart_data_layer' and associated data
      // to the dataLayer, which GTM will then pick up.
      if (typeof window.dataLayer === 'object') {
        const currentCartTotal = cart.reduce((acc, item) => acc + item.price, 0);

        window.dataLayer.push({
          'event': 'add_to_cart_data_layer', // Custom event name for GTM
          'ecommerce': { // GA4 recommended e-commerce object structure
            'items': [{
              'item_id': name.replace(/\s/g, '_').toLowerCase(), // Unique ID for the item
              'item_name': name,
              'price': price,
              'quantity': 1
            }],
            'value': currentCartTotal, // Total value of items in cart
            'currency': 'USD' // Currency code
          }
        });
        console.log(`DataLayer push for add_to_cart_data_layer: ${name}`);
      } else {
        console.log("dataLayer is not defined. Google Tag Manager might not be loaded.");
      }
    });
  });
}

// CART PAGE - Initializes cart display and event listeners for removing items
function initCart() {
  const cartList = document.getElementById("cart-list");
  const cartTotalSpan = document.getElementById("cart-total");

  /**
   * Renders the cart items in the UI.
   */
  function renderCart() {
    cartList.innerHTML = ""; // Clear existing list
    let total = 0;

    if (cart.length === 0) {
      cartList.innerHTML = "<p class='text-gray-600'>Your cart is empty.</p>";
    } else {
      cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-3";
        li.innerHTML = `
          <span>${item.name} - $${item.price.toFixed(2)}</span>
          <button class="remove-from-cart text-red-500 hover:text-red-700 font-semibold" data-index="${index}">Remove</button>
        `;
        cartList.appendChild(li);
        total += item.price;
      });
    }

    cartTotalSpan.textContent = total.toFixed(2);
    updateCartCount(); // Update cart count in navbar
  }

  // Event delegation for remove buttons
  cartList.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-from-cart")) {
      const index = parseInt(event.target.getAttribute("data-index"));
      const removedItem = cart[index];

      // Remove item from cart array
      cart.splice(index, 1);
      saveCart(); // Save updated cart to local storage
      renderCart(); // Re-render the cart display

      // --- GA4: Send remove_from_cart event with item details ---
      if (typeof gtag === "function") {
        const currentCartTotal = cart.reduce((acc, item) => acc + item.price, 0);
        gtag('event', 'remove_from_cart', {
          items: [{
            item_id: removedItem.name.replace(/\s/g, '_').toLowerCase(),
            item_name: removedItem.name,
            price: removedItem.price,
            quantity: 1
          }],
          value: currentCartTotal,
          currency: 'USD'
        });
      } else {
        console.log("gtag is not defined. Google Analytics might be blocked or not loaded.");
      }
    }
  });

  renderCart(); // Initial render when cart page loads
}

// CONTACT PAGE - Initializes form submission handler
function initContactForm() {
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function(event) {
      event.preventDefault(); // Prevent default form submission

      // Collect form data
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const inquiryCategory = document.getElementById("inquiryCategory").value;
      const message = document.getElementById("message").value;
      const age = document.getElementById("age").value;
      const rating = document.getElementById("rating").value;

      // Send data to Google Analytics using dataLayer.push for custom event
      if (typeof window.dataLayer === 'object') {
        window.dataLayer.push({
          'event': 'contact_form_submit_custom', // Custom event name
          'form_name': 'SneakKicks Contact Form',
          'inquiry_category': inquiryCategory,
          'form_rating': parseFloat(rating),
          'user_name': name,
          'user_email': email,
          'user_age': parseInt(age),
          'message_length': message.length
        });
        console.log("DataLayer push for contact_form_submit_custom event.");
      } else {
        console.log("dataLayer is not defined. Google Tag Manager might be blocked or not loaded.");
      }

      // Provide user feedback and reset the form
      showCustomMessage("Thank you for your message! We will get back to you soon.");
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
  updateCartCount(); // Ensure cart count is updated on all pages
};
