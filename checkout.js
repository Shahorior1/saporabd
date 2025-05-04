// Load cart items from localStorage
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const cartItemsContainer = document.getElementById('checkout-cart-items');
    const subtotalElem = document.getElementById('checkout-subtotal');
    const shippingElem = document.getElementById('checkout-shipping');
    const discountElem = document.getElementById('checkout-discount');
    const totalElem = document.getElementById('checkout-total');
    const cartCountElement = document.getElementById('cart-count');
    const shippingInsideRadio = document.getElementById('shipping-inside-dhaka');
    const shippingOutsideRadio = document.getElementById('shipping-outside-dhaka');
    const placeOrderButton = document.getElementById('place-order-btn');
    const couponToggle = document.getElementById('coupon-toggle');
    const couponForm = document.getElementById('coupon-form');
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    const addressField = document.getElementById('address');
    const districtField = document.getElementById('district');
    const cashOnDeliveryRadio = document.getElementById('payment-cod');
    const bkashRadio = document.getElementById('payment-bkash');
    
    // Shipping fees
    const SHIPPING_FEE_INSIDE_DHAKA = 80;
    const SHIPPING_FEE_OUTSIDE_DHAKA = 60;
    
    // Load cart from localStorage
    const cart = JSON.parse(localStorage.getItem('saporaBDCart')) || [];
    
    // Initialize
    updateCartCount();
    renderCartItems();
    updateOrderSummary();
    setupEventListeners();
    
    function setupEventListeners() {
        // Coupon toggle
        if (couponToggle && couponForm) {
            couponToggle.addEventListener('click', function(e) {
                e.preventDefault();
                couponForm.classList.toggle('hidden');
            });
        }
        
        // Apply coupon button
        const applyButton = document.getElementById('apply-coupon');
        const couponInput = document.getElementById('coupon-code');
        
        if (applyButton && couponInput) {
            applyButton.addEventListener('click', function() {
                const couponCode = couponInput.value.trim();
                if (!couponCode) {
                    showNotification('Please enter a coupon code', 'info');
                    return;
                }
                
                // Simple validation (in real app would validate with backend)
                if (couponCode === 'SAVE10') {
                    showNotification('Coupon applied: 10% discount!', 'success');
                    updateOrderSummary(10); // 10% discount
                    
                    // Update coupon toggle text
                    couponToggle.textContent = `Coupon "${couponCode}" applied! Click to change`;
                    couponToggle.classList.add('text-green-500');
                    couponForm.classList.add('hidden');
                } else {
                    showNotification('Invalid coupon code', 'error');
                }
            });
        }
        
        // Shipping options
        if (shippingInsideRadio && shippingOutsideRadio) {
            shippingInsideRadio.addEventListener('change', updateOrderSummary);
            shippingOutsideRadio.addEventListener('change', updateOrderSummary);
        }
        
        // Payment method toggle
        if (bkashRadio) {
            const bkashDetails = document.getElementById('bkash-details');
            bkashRadio.addEventListener('change', function() {
                if (bkashDetails) {
                    bkashDetails.classList.remove('hidden');
                }
            });
        }
        
        if (cashOnDeliveryRadio) {
            const bkashDetails = document.getElementById('bkash-details');
            cashOnDeliveryRadio.addEventListener('change', function() {
                if (bkashDetails) {
                    bkashDetails.classList.add('hidden');
                }
            });
        }
        
        // Place order button
        if (placeOrderButton) {
            placeOrderButton.addEventListener('click', validateAndPlaceOrder);
        }
    }
    
    function validateAndPlaceOrder(e) {
        e.preventDefault();
        
        // Check if cart is empty
        if (cart.length === 0) {
            showNotification('Your cart is empty. Please add items before checkout.', 'error');
            return;
        }
        
        // Required fields validation
        const requiredFields = [
            { field: nameField, name: 'আপনার নাম' },
            { field: phoneField, name: 'মোবাইল নম্বর' },
            { field: addressField, name: 'সম্পূর্ণ ঠিকানা' }
        ];
        
        for (const {field, name} of requiredFields) {
            if (!field || !field.value.trim()) {
                showNotification(`${name} is required`, 'error');
                field.focus();
                return;
            }
        }
        
        // Validate phone number format (basic check)
        const phoneRegex = /^01[0-9]{9}$/;
        if (phoneField && !phoneRegex.test(phoneField.value.trim())) {
            showNotification('Please enter a valid Bangladeshi phone number', 'error');
            phoneField.focus();
            return;
        }
        
        // Check payment method
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
        if (!paymentMethod) {
            showNotification('Please select a payment method', 'error');
            return;
        }
        
        // If bKash is selected, validate transaction ID
        if (paymentMethod.value === 'bkash') {
            const transactionId = document.getElementById('transaction-id');
            if (!transactionId || !transactionId.value.trim()) {
                showNotification('Please enter your bKash transaction ID', 'error');
                if (transactionId) transactionId.focus();
                return;
            }
        }
        
        // Calculate totals
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shippingCost = shippingInsideRadio && shippingInsideRadio.checked ? SHIPPING_FEE_INSIDE_DHAKA : SHIPPING_FEE_OUTSIDE_DHAKA;
        const total = subtotal + shippingCost;
        
        // Generate order ID
        const orderId = generateOrderId();
        
        // Collect order data
        const orderData = {
            orderId: orderId,
            customerName: nameField.value.trim(),
            email: '',
            phone: phoneField.value.trim(),
            address: addressField.value.trim(),
            city: '',
            district: '',
            postalCode: '',
            paymentMethod: paymentMethod.value,
            transactionId: paymentMethod.value === 'bkash' ? document.getElementById('transaction-id').value.trim() : null,
            items: cart.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            subtotal: subtotal,
            shipping: shippingCost,
            discount: 0,
            total: total,
            orderDate: new Date().toISOString(),
            notes: document.getElementById('notes') ? document.getElementById('notes').value.trim() : '',
            status: 'Pending'
        };
        
        // Show sending order notification
        showNotification('Placing your order...', 'info');
        
        // Send order to server
        fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Save order to localStorage as backup
                const orders = JSON.parse(localStorage.getItem('saporaBDOrders')) || [];
                orders.push(orderData);
                localStorage.setItem('saporaBDOrders', JSON.stringify(orders));
                
                // Clear the cart
                localStorage.setItem('saporaBDCart', JSON.stringify([]));
                
                // Show success message
                showNotification('Order placed successfully!', 'success');
                
                // Show confirmation modal
                showOrderConfirmationModal(orderData);
            } else {
                throw new Error(data.message || 'Failed to place order');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            
            // Fallback to localStorage if server fails
            showNotification('Failed to connect to server. Saving order locally.', 'warning');
            
            // Save order to localStorage
            const orders = JSON.parse(localStorage.getItem('saporaBDOrders')) || [];
            orders.push(orderData);
            localStorage.setItem('saporaBDOrders', JSON.stringify(orders));
            
            // Clear the cart
            localStorage.setItem('saporaBDCart', JSON.stringify([]));
            
            // Show confirmation modal
            showOrderConfirmationModal(orderData);
        });
    }
    
    function generateOrderId() {
        // Generate a random order ID (would normally be done server-side)
        return 'BD-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 1000);
    }
    
    function updateCartCount() {
        if (cartCountElement) {
            const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
            cartCountElement.textContent = itemCount;
        }
    }
    
    function renderCartItems() {
        if (!cartItemsContainer) {
            console.error('Cart items container not found');
            return;
        }
        
        // Clear existing content
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center py-4 text-gray-500">Your cart is empty</p>';
            return;
        }
        
        // Add each cart item
        cart.forEach(item => {
            const itemElem = document.createElement('div');
            itemElem.className = 'flex justify-between items-center py-3 border-b';
            
            itemElem.innerHTML = `
                <div class="flex items-center">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded mr-3">
                    <div>
                        <h3 class="font-medium">${item.name}</h3>
                        <div class="flex items-center mt-1">
                            <button class="decrease-quantity px-2 py-1 border border-gray-300 rounded-l">-</button>
                            <input type="number" value="${item.quantity}" min="1" class="item-quantity w-10 text-center border-t border-b border-gray-300" readonly>
                            <button class="increase-quantity px-2 py-1 border border-gray-300 rounded-r">+</button>
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <span class="font-medium">${formatPrice(item.price * item.quantity)}</span>
                    <button class="remove-item ml-3 text-gray-400 hover:text-red-500">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // Add event listeners
            const removeButton = itemElem.querySelector('.remove-item');
            const decreaseButton = itemElem.querySelector('.decrease-quantity');
            const increaseButton = itemElem.querySelector('.increase-quantity');
            const quantityInput = itemElem.querySelector('.item-quantity');
            
            if (removeButton) {
                removeButton.addEventListener('click', () => removeCartItem(item.id));
            }
            
            if (decreaseButton) {
                decreaseButton.addEventListener('click', () => updateItemQuantity(item.id, item.quantity - 1));
            }
            
            if (increaseButton) {
                increaseButton.addEventListener('click', () => updateItemQuantity(item.id, item.quantity + 1));
            }
            
            cartItemsContainer.appendChild(itemElem);
        });
    }
    
    function removeCartItem(itemId) {
        // Find item index
        const itemIndex = cart.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;
        
        // Remove the item
        cart.splice(itemIndex, 1);
        
        // Update localStorage
        localStorage.setItem('saporaBDCart', JSON.stringify(cart));
        
        // Update UI
        renderCartItems();
        updateCartCount();
        updateOrderSummary();
        
        showNotification('Item removed from cart');
    }
    
    function updateItemQuantity(itemId, quantity) {
        // Find item
        const itemIndex = cart.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;
        
        if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            removeCartItem(itemId);
            return;
        }
        
        // Update quantity
        cart[itemIndex].quantity = quantity;
        
        // Update localStorage
        localStorage.setItem('saporaBDCart', JSON.stringify(cart));
        
        // Update UI
        renderCartItems();
        updateCartCount();
        updateOrderSummary();
    }
    
    function updateOrderSummary(discountPercent = 0) {
        if (!subtotalElem || !totalElem) return;
        
        // Calculate subtotal
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Determine shipping fee
        let shipping = 0;
        if (shippingInsideRadio && shippingInsideRadio.checked) {
            shipping = SHIPPING_FEE_INSIDE_DHAKA;
        } else if (shippingOutsideRadio && shippingOutsideRadio.checked) {
            shipping = SHIPPING_FEE_OUTSIDE_DHAKA;
        }
        
        // Calculate discount
        const discount = (subtotal * discountPercent) / 100;
        
        // Calculate total
        const total = subtotal + shipping - discount;
        
        // Update display
        subtotalElem.textContent = formatPrice(subtotal);
        
        if (shippingElem) {
            shippingElem.textContent = formatPrice(shipping);
        }
        
        if (discountElem) {
            if (discount > 0) {
                discountElem.textContent = `-${formatPrice(discount)}`;
                discountElem.parentElement.classList.remove('hidden');
            } else {
                discountElem.parentElement.classList.add('hidden');
            }
        }
        
        totalElem.textContent = formatPrice(total);
    }
    
    function formatPrice(price) {
        return `${price}৳`;
    }
    
    // Create notification container
    function createNotificationContainer() {
        if (document.getElementById('notification-container')) {
            return;
        }
        
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'fixed top-4 right-4 z-50 flex flex-col items-end space-y-2';
        document.body.appendChild(container);
    }
    
    // Show notification
    function showNotification(message, type = 'success') {
        // Create container if it doesn't exist
        createNotificationContainer();
        
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification bg-white rounded-lg shadow-lg p-4 flex items-center max-w-md transform transition-all duration-300 translate-x-full';
        
        // Set icon and color based on type
        let iconClass = 'fas fa-check-circle text-green-500';
        if (type === 'error') {
            iconClass = 'fas fa-exclamation-circle text-red-500';
        } else if (type === 'info') {
            iconClass = 'fas fa-info-circle text-blue-500';
        } else if (type === 'warning') {
            iconClass = 'fas fa-exclamation-triangle text-yellow-500';
        }
        
        notification.innerHTML = `
            <i class="${iconClass} mr-3 text-lg"></i>
            <p class="flex-1 text-gray-800">${message}</p>
            <button class="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add close button event
        const closeButton = notification.querySelector('button');
        closeButton.addEventListener('click', () => {
            notification.classList.replace('translate-x-0', 'translate-x-full');
            setTimeout(() => {
                container.removeChild(notification);
            }, 300);
        });
        
        // Add to container
        container.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.replace('translate-x-full', 'translate-x-0');
        }, 10);
        
        // Auto remove after delay
        setTimeout(() => {
            if (notification.parentNode === container) {
                notification.classList.replace('translate-x-0', 'translate-x-full');
                setTimeout(() => {
                    if (notification.parentNode === container) {
                        container.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    function showOrderConfirmationModal(orderData) {
        const modal = document.getElementById('order-confirmation-modal');
        const orderIdElement = document.getElementById('order-id');
        const orderDateElement = document.getElementById('order-date');
        const orderPaymentMethodElement = document.getElementById('order-payment-method');
        const orderItemsSummaryElement = document.getElementById('order-items-summary');
        const orderTotalAmountElement = document.getElementById('order-total-amount');
        const closeModalBtn = document.getElementById('close-modal-btn');
        
        if (!modal) return;
        
        // Format date
        const orderDate = new Date(orderData.orderDate);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Update modal content
        if (orderIdElement) orderIdElement.textContent = orderData.orderId;
        if (orderDateElement) orderDateElement.textContent = formattedDate;
        if (orderPaymentMethodElement) {
            const paymentMethodText = orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                                     orderData.paymentMethod === 'bkash' ? 'bKash Payment' : 'Online Payment';
            orderPaymentMethodElement.textContent = paymentMethodText;
        }
        
        // Show order items summary
        if (orderItemsSummaryElement) {
            orderItemsSummaryElement.innerHTML = '';
            
            if (orderData.items && orderData.items.length > 0) {
                const itemsList = document.createElement('ul');
                itemsList.className = 'space-y-1';
                
                orderData.items.forEach(item => {
                    const listItem = document.createElement('li');
                    listItem.className = 'flex justify-between';
                    listItem.innerHTML = `
                        <span>${item.name} × ${item.quantity}</span>
                        <span>${formatPrice(item.price * item.quantity)}</span>
                    `;
                    itemsList.appendChild(listItem);
                });
                
                orderItemsSummaryElement.appendChild(itemsList);
            } else {
                orderItemsSummaryElement.innerHTML = '<p>No items in this order</p>';
            }
        }
        
        // Show total amount
        if (orderTotalAmountElement) {
            orderTotalAmountElement.textContent = formatPrice(orderData.total);
        }
        
        // Show modal
        modal.classList.remove('hidden');
        
        // Close modal event
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', function() {
                modal.classList.add('hidden');
                // Redirect to order complete page
                window.location.href = 'order-complete.html?id=' + orderData.orderId;
            });
        }
    }
}); 