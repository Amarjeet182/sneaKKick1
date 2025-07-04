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
      updateCartCount(); // Optional: live count on navbar

      // --- GA4: Send add_to_cart event with item details and updated cart length/value ---
      if (typeof gtag === "function") {
        const currentCartTotal = cart.reduce((acc, item) => acc + item.price, 0); // Calculate total on add
        gtag('event', 'add_to_cart', {
          items: [{ // Recommended way to send item data in GA4 for e-commerce events
            item_id: name.replace(/\s/g, '_').toLowerCase(), // Example: create an item_id
            item_name: name,
            price: price, // Use 'price' for the item's price
            quantity: 1 // Assuming 1 quantity per add to cart click
          }],
          cart_length: cart.length,
          cart_total_value: currentCartTotal // Send the current total cart value
        });
      }
    });
  });

  updateCartCount();
}

// CART PAGE
function initCart() {
  const cartList = document.getElementById("cart-list");
  const totalSpan = document.getElementById("total"); // Renamed for clarity, was 'total'
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

    totalSpan.textContent = `₹${sum.toFixed(2)}`; // Update display total

    // --- GA4: Send cart_view_update event when cart display is updated ---
    if (typeof gtag === "function") {
      gtag('event', 'cart_view_update', {
        cart_length: cart.length,
        cart_total_value: sum // Send the updated total cart value
      });
    }
  }

  // Initial display and GA4 event on cart page load
  updateCartDisplay();

  // --- GA4: Send an event on cart page load with initial cart data ---
  if (typeof gtag === "function") {
    const initialCartTotal = cart.reduce((acc, item) => acc + item.price, 0);
    gtag('event', 'page_view', { // Use page_view or a custom event like 'cart_page_loaded'
      page_title: document.title,
      page_location: window.location.href,
      cart_length: cart.length,
      cart_total_value: initialCartTotal
    });
  }


  // Event listener for remove buttons
  cartList.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const index = parseInt(e.target.getAttribute("data-index"));
      const removedItem = cart[index]; // Get the item being removed

      cart.splice(index, 1);
      saveCart();
      updateCartDisplay();

      // --- GA4: Send remove_from_cart event ---
      if (typeof gtag === "function") {
        const currentCartTotal = cart.reduce((acc, item) => acc + item.price, 0); // Recalculate total after removal
        gtag('event', 'remove_from_cart', {
          items: [{
            item_id: removedItem.name.replace(/\s/g, '_').toLowerCase(),
            item_name: removedItem.name,
            price: removedItem.price,
            quantity: 1
          }],
          cart_length: cart.length,
          cart_total_value: currentCartTotal // Send the updated total cart value
        });
      }
    }
  });

  // Event listener for checkout button
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length > 0) {
        // --- GA4: Send begin_checkout event ---
        if (typeof gtag === "function") {
          const finalCartTotal = cart.reduce((acc, item) => acc + item.price, 0);
          gtag('event', 'begin_checkout', {
            items: cart.map(item => ({ // Send all items in the cart
              item_id: item.name.replace(/\s/g, '_').toLowerCase(),
              item_name: item.name,
              price: item.price,
              quantity: 1
            })),
            cart_length: cart.length,
            value: finalCartTotal, // For begin_checkout, 'value' is commonly used for total value
            currency: "INR" // Assuming Indian Rupee, adjust if different
          });
        }

        alert("Proceeding to checkout!");
        cart = []; // Clear cart after checkout
        saveCart();
        updateCartDisplay(); // Update display to show empty cart
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
      e.preventDefault(); // Prevent the default form submission

      // Get form data
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const inquiryCategory = document.getElementById("inquiry_category").value;
      const message = document.getElementById("message").value;
      const age = document.getElementById("age").value;
      const rating = document.getElementById("rating").value;

      // Send data to Google Analytics
      if (typeof gtag === "function") {
        gtag("event", "form_submit", {
          event_category: "Contact Form",
          // Using more descriptive parameter names for custom dimensions/metrics
          inquiry_category: inquiryCategory, // This maps to Inquiry Category dimension
          form_rating: parseFloat(rating), // This maps to Form Submission Rating metric (ensure it's a number)
          user_name: name,
          user_email: email,
          user_age: parseInt(age), // Ensure age is an integer
          message_length: message.length,
        });
      } else {
        console.log("gtag is not defined. Google Analytics might be blocked or not loaded.");
      }

      // Provide user feedback and reset the form
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
  updateCartCount(); // Update cart count on all pages if applicable
};
