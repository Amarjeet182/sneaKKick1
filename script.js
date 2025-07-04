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

      // --- Adobe Analytics: Send Add to Cart event ---
      // Check if the 's' object (from Adobe Tags) is available
      if (typeof s !== "undefined") {
        s.products = "%;" + name + ";1;" + price; // Format: Category;Product;Quantity;Price
        s.events = "event2,event6=" + price + ",event8=1"; // scAdd, cartAddValue, itemsAdded
        s.eVar2 = name; // Product Name (Last Added)
        s.eVar3 = price; // Product Price (Last Added)
        s.tl(true, 'o', 'Add to Cart - ' + name); // Link tracking call
      }
      // Removed gtag('event', 'add_to_cart', ...)
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

    totalSpan.textContent = `₹${sum.toFixed(2)}`; // Update display total
    // Removed gtag('event', 'cart_view_update', ...)
  }

  // Initial display and Adobe Analytics event on cart page load
  updateCartDisplay();

  // --- Adobe Analytics: Send Page View event for Cart Page ---
  if (typeof s !== "undefined") {
    const initialCartTotal = cart.reduce((acc, item) => acc + item.price, 0);
    s.pageName = document.title; // Set page name
    s.prop3 = cart.length; // Cart Item Count on page load
    s.prop4 = initialCartTotal; // Cart Value on page load
    s.events = "event5"; // Cart Page Viewed
    s.t(); // Page view tracking call
  }
  // Removed gtag('event', 'page_view', ...)


  // Event listener for remove buttons
  cartList.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const index = parseInt(e.target.getAttribute("data-index"));
      const removedItem = cart[index]; // Get the item being removed

      cart.splice(index, 1);
      saveCart();
      updateCartDisplay();

      // --- Adobe Analytics: Send Remove from Cart event ---
      if (typeof s !== "undefined") {
        s.products = "%;" + removedItem.name + ";-1;" + removedItem.price; // Quantity -1 for removal
        s.events = "event3,event7=" + removedItem.price + ",event9=1"; // scRemove, cartRemoveValue, itemsRemoved
        s.eVar2 = removedItem.name; // Product Name (Last Removed)
        s.eVar3 = removedItem.price; // Product Price (Last Removed)
        s.tl(true, 'o', 'Remove from Cart - ' + removedItem.name); // Link tracking call
      }
      // Removed gtag('event', 'remove_from_cart', ...)
    }
  });

  // Event listener for checkout button
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length > 0) {
        // --- Adobe Analytics: Send Begin Checkout event ---
        if (typeof s !== "undefined") {
          const finalCartTotal = cart.reduce((acc, item) => acc + item.price, 0);
          // Build products string for all items in cart
          const productListString = cart.map(item => `%;${item.name};1;${item.price}`).join('');
          s.products = productListString.substring(1); // Remove leading semicolon
          s.total = finalCartTotal; // Total value of the cart
          s.currencyCode = "INR"; // Set currency code as per your GA4 config
          s.events = "event4"; // scCheckout
          s.tl(true, 'o', 'Begin Checkout'); // Link tracking call
        }
        // Removed gtag('event', 'begin_checkout', ...)

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

      // --- Adobe Analytics: Send Form Submit event ---
      if (typeof s !== "undefined") {
        s.prop5 = "Contact Us Form"; // Form Name
        s.eVar5 = inquiryCategory; // Inquiry Category
        s.eVar6 = parseFloat(rating); // Form Submission Rating
        s.eVar7 = name; // User Name Submitted
        s.eVar8 = email; // User Email Submitted
        s.eVar9 = message.length; // Message Length
        s.events = "event10"; // formSubmit
        s.tl(true, 'o', 'Contact Form Submitted - ' + inquiryCategory); // Link tracking call
      }
      // Removed gtag("event", "form_submit", ...)
      // Removed else block for gtag not defined as we are using Adobe now.

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
