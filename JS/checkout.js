document.addEventListener('DOMContentLoaded', () => {
  let selectedPayment = ''

  document.querySelectorAll('.payment-box').forEach(box => {
    box.addEventListener('click', () => {
      document
        .querySelectorAll('.payment-box')
        .forEach(b => b.classList.remove('selected'))
      box.classList.add('selected')
      selectedPayment = box.dataset.method

      // Store in hidden input
      document.getElementById('paymentMethod').value = selectedPayment
    })
  })


    const orderId = localStorage.getItem('orderId') || 'N/A'
    const cart = JSON.parse(localStorage.getItem('cart')) || {}

    let cartSummary = Object.keys(cart)
      .map(id => {
        const item = cart[id]
        return `${item.name} (x${item.quantity})- Rs.${
          item.price * item.quantity
        }`
      })
      .join('\n')

    let total = Object.keys(cart).reduce(
      (sum, id) => sum + cart[id].price * cart[id].quantity,
      0
    )
    if (total > 0) total += 150
    document.getElementById('orderId').value = orderId
    document.getElementById('cart-items').value = cartSummary
    document.getElementById('total').value = total
    document.addEventListener('DOMContentLoaded', () => {
  let selectedPayment = ''

  document.querySelectorAll('.payment-box').forEach(box => {
    box.addEventListener('click', () => {
      document
        .querySelectorAll('.payment-box')
        .forEach(b => b.classList.remove('selected'))
      box.classList.add('selected')
      selectedPayment = box.dataset.method

      // Store in hidden input
      document.getElementById('paymentMethod').value = selectedPayment
    })
  })


    const orderId = localStorage.getItem('orderId') || 'N/A'
    const cart = JSON.parse(localStorage.getItem('cart')) || {}

    let cartSummary = Object.keys(cart)
      .map(id => {
        const item = cart[id]
        return `${item.name} (x${item.quantity})- Rs.${
          item.price * item.quantity
        }`
      })
      .join('\n')

    let total = Object.keys(cart).reduce(
      (sum, id) => sum + cart[id].price * cart[id].quantity,
      0
    )
    if (total > 0) total += 150
    document.getElementById('orderId').value = orderId
    document.getElementById('cart-items').value = cartSummary
    document.getElementById('total').value = total
    
    // Continue to process the order
    
    
    function handleCheckout(){
      payment=document.getElementById('paymentMethod').value;
    Name=document.getElementById('firstName').value;
    contact=document.getElementById('contact').value;
    city=document.getElementById('city').value;
    house=document.getElementById('house').value;
    block=document.getElementById('block').value;
    landmark=document.getElementById('landmark').value;
    area=document.getElementById('area').value;
    
      if (payment === 'Online Payment') {
        const message =
          `*New Order via Online Payment*\n\n` +
          `👤 Name: ${Name}\n📞 Contact: ${contact}\n📦 City: ${city}\n🏠 House: ${house}, Block: ${block}\n📍 Landmark: ${landmark}\n🗺️ Area: ${area}\n\n🧾 *Order ID:* ${orderId}\n🛒 *Cart:*\n${cartSummary}\n\n💰 *Total (incl. delivery): Rs.${total}*`;
  
        const whatsappUrl = `https://wa.me/923238083588?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }
      localStorage.removeItem("cart");
      localStorage.removeItem("orderId");
      return true

    }
   
});
    // Continue to process the order
});
