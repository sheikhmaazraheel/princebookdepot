console.log("JS loaded")

// For Hamburger

const hamburger = document.getElementById('hamburger')
const nav = document.querySelector('nav')
const overlay = document.getElementById('menu-overlay')

// Toggle menu when hamburger is clicked
hamburger.addEventListener('click', () => {
  nav.classList.toggle('show-nav')
})

overlay.addEventListener('click', e => {
  if (e.target === overlay) {
    const mobileMenu = document.getElementById('mobile-menu')

    // Step 1: Apply "closing" animation class
    mobileMenu.classList.add('closing')

    // Step 2: Wait for transition to finish before removing layout class
    setTimeout(() => {
      mobileMenu.classList.remove('closing')
      nav.classList.remove('show-nav')
    }, 300) // same duration as CSS transition
  }
})

// ============== Rendering Products ===============
document.addEventListener('DOMContentLoaded', () => {
  let cart = JSON.parse(localStorage.getItem('cart')) || {}
  // Shared Cart Logic Setup
  function setupCartForProduct (product) {
    const addToCartBtn = product.querySelector('.add-to-cart-button')
    const qtyControls = product.querySelector('.quantity-controls')
    const qtyDisplay = product.querySelector('.quantity')
    const increaseBtn = product.querySelector('.increase')
    const decreaseBtn = product.querySelector('.decrease')

    const productId = product.dataset.id
    const productName = product.dataset.name
    const productPrice = parseFloat(product.dataset.price)

    // ✅ Load cart from localStorage
    
    let quantity = cart[productId]?.quantity || 0

    // ✅ If product is already in cart, show quantity controls
    if (quantity > 0) {
      addToCartBtn.style.display = 'none'
      qtyControls.classList.add('active')
      qtyDisplay.textContent = quantity
    }

    // ➕ Add to Cart
    addToCartBtn.addEventListener('click', () => {
      quantity = 1
      cart[productId] = { name: productName, price: productPrice, quantity }
      localStorage.setItem('cart', JSON.stringify(cart))

      addToCartBtn.style.display = 'none'
      qtyControls.classList.add('active')
      qtyDisplay.textContent = quantity
    })

    // ➕ Increase Quantity
    increaseBtn.addEventListener('click', () => {
      quantity++
      cart[productId].quantity = quantity
      localStorage.setItem('cart', JSON.stringify(cart))

      qtyDisplay.textContent = quantity
      qtyDisplay.style.transform = 'scale(1.2)'
      setTimeout(() => {
        qtyDisplay.style.transform = 'scale(1)'
      }, 150)
    })

    // ➖ Decrease Quantity
    decreaseBtn.addEventListener('click', () => {
      quantity--

      if (quantity <= 0) {
        delete cart[productId]
        localStorage.setItem('cart', JSON.stringify(cart))
        addToCartBtn.style.display = 'inline-block'
        qtyControls.classList.remove('active')
      } else {
        cart[productId].quantity = quantity
        localStorage.setItem('cart', JSON.stringify(cart))
        qtyDisplay.textContent = quantity

        qtyDisplay.style.transform = 'scale(1.2)'
        setTimeout(() => {
          qtyDisplay.style.transform = 'scale(1)'
        }, 150)
      }
    })
  }

  // ✅ PRODUCT PAGES 
  if(document.body.dataset.category){
    const category = document.body.dataset.category 
    const loader=document.getElementById('loader');
    const container=document.getElementById('Product-grid');
    container.style.display="none";
    fetch(
      'https://script.google.com/macros/s/AKfycbxMoDKCh-ywDckfEeyLklRSSHO6932khQ5-DegVL0FqRwza98AgDrgSQAxgW10b31tm/exec'
    )
      .then(res => res.json())
      .then(products => {
        loader.style.display="none";
        container.style.display="grid";
        
        const filtered = products.filter(
          p => p.category === category && !!p.availible
        )

        filtered.forEach(product => {
          console.log('Rendering Products', product)
          const div = document.createElement('div')
          div.className = 'Product'
          div.dataset.id = product.id
          div.dataset.name = product.name
          div.dataset.price = product.price

          div.innerHTML = `
          <h3>${product.name}</h3>
          <img src="${product.image}" alt="${product.name}">
          <p class="book-price">Rs. ${product.price}</p>
          <button class="add-to-cart-button">Add to Cart</button>
          <div class="quantity-controls">
            <button class="decrease">−</button>
            <span class="quantity">1</span>
            <button class="increase">+</button>
          </div>
        `

          container.appendChild(div)
          setupCartForProduct(div) // Hook cart logic
          document.querySelectorAll('.Product').forEach(setupCartForProduct)
        })
        // Also apply logic to any manually written Product cards
      

        document.querySelectorAll('.Product').forEach(setupCartForProduct)
    })
  }  
  console.log("Hello")
  // ✅ CART PAGE
  const cartItemsTbody = document.getElementById('cart-items')
  const orderIdSpan = document.getElementById('order-id')
  const Quantity = document.getElementById('Quantity-heading')
  const cartSummary = document.getElementById('cart-summary')
  const cartTable = document.getElementById('cart-table')
  const cartHeadings = document.getElementById('summary-headings')
  const totalRow = document.getElementById('total')
  const totalColumn = document.getElementById('totalColumn')
  
  let subtotal = 0
  let total = 0
  cartItemsTbody.innerHTML = ''

  Object.keys(cart).forEach(id => {
    const item = cart[id]
    const price = item.price || 0
    const qty = item.quantity || 0
    const amount = price * qty
    subtotal += amount

    const row = document.createElement('tr')
    row.innerHTML = `
      <td>${item.name || 'Unnamed'}</td>
      <td>${price}</td>
      <td class="qty-cell">
        <button class="qty-btn decrease" data-id="${id}">−</button>
        <span class="quantity" id="qty-${id}">${qty}</span>
        <button class="qty-btn increase" data-id="${id}">+</button>
      </td>
      <td >${amount}</td>
    `

    cartItemsTbody.appendChild(row)
  })
  

  // ======= SYNC COLUMNS WIDTH
  function syncColumnWidths () {
    // Get first row of cartTable
    const cartTableRow = cartTable.rows[0]
    // Sum width of first three columns
    const width1 = cartTableRow.cells[0].getBoundingClientRect().width
    const width2 = cartTableRow.cells[1].getBoundingClientRect().width
    const width3 = cartTableRow.cells[2].getBoundingClientRect().width
    const totalWidth = width1 + width2 + width3

    // Apply the calculated width
    cartHeadings.style.width = totalWidth + 'px'
    totalColumn.style.width = totalWidth + 'px'
  }

  // Run on load and on resize
  window.addEventListener('load', syncColumnWidths)
  window.addEventListener('resize', syncColumnWidths)

  //  ======== ADDING CART SUMMARY
  let deliveryCharges = 0
  if (subtotal != 0) {
    deliveryCharges = 150
  }
  total = subtotal + deliveryCharges;
  const deliveryCell = document.getElementById('delivery-charges')

  const Summaryrow = document.createElement('tr')
  Summaryrow.innerHTML = ` 
        <td id="summary-headings">Sub-total :</td>
        <td id="summary-data">Rs.${subtotal}</td>
  `
  deliveryCell.innerHTML = `Rs.${deliveryCharges}`
  cartSummary.prepend(Summaryrow)
  const Row = document.createElement('tr')
  Row.innerHTML = ` 
        <td id="summary-headings">Total :</td>
        <td id="summary-data">Rs.${total}</td>
      
  `
  totalRow.appendChild(Row)
  const smallScreenQuery = window.matchMedia('(max-width:768px)')
  function changeQuantityText () {
    if (smallScreenQuery.matches) {
      Quantity.textContent = 'Qty.'
    }
  }
  changeQuantityText()
  document.querySelectorAll('.qty-btn').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.id
      const isIncrease = button.classList.contains('increase')
      const cart = JSON.parse(localStorage.getItem('cart')) || {}
      const item = cart[id]

      if (!item) return

      // Update quantity
      item.quantity += isIncrease ? 1 : -1

      // If quantity is 0, remove item
      if (item.quantity <= 0) {
        delete cart[id]
      } else {
        cart[id] = item
      }

      // Save and reload
      localStorage.setItem('cart', JSON.stringify(cart))
      location.reload()
    })
  })
  // ORDER ID
  function generateOrderId () {
    const now = new Date()

    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0') // 0-based
    const year = now.getFullYear()

    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')

    // Optional: Add milliseconds for extra uniqueness
    const ms = String(now.getMilliseconds()).padStart(3, '0')

    return `PBD-${day}${month}${year}-${hours}${minutes}${seconds}${ms}`
  }

  let orderId = localStorage.getItem('orderId')
  const cartArray = JSON.parse(localStorage.getItem('cart')) || {}
  const hasItem=Object.keys(cartArray).length>0;
  if (hasItem) {
    if (!orderId) {
      orderId = generateOrderId()
    }
  } else {
    orderId = generateOrderId()
  }
  localStorage.setItem('orderId', orderId)
  orderIdSpan.textContent = orderId

  const placeOrderBtn=document.getElementById('place-order');
  if(!placeOrderBtn) return;

  placeOrderBtn.addEventListener("click",()=>{
    const cart=JSON.parse(localStorage.getItem("cart")) || {};
    const hasItem=Object.keys(cart).length>0;

    if (hasItem){
      window.location.href="checkout.html";
    }
    else{
      alert("Your Cart is Empty. Please add items before placing an Order")
    }
  })


})