document.addEventListener('DOMContentLoaded', function() {
    // Shipping fee constants
    const SHIPPING_FEE_INSIDE_DHAKA = 80;
    const SHIPPING_FEE_OUTSIDE_DHAKA = 60;
    
    // DOM elements
    const cartCountElement = document.getElementById('cart-count');
    const orderDateElement = document.getElementById('order-date');
    const orderSubtotalElement = document.getElementById('order-subtotal');
    const orderShippingElement = document.getElementById('order-shipping');
    const orderTotalElement = document.getElementById('order-total');
    const orderTotalRowElement = document.getElementById('order-total-row');
    const paymentMethodElement = document.getElementById('payment-method');
    const paymentMethodRowElement = document.getElementById('payment-method-row');
    const orderItemsContainer = document.getElementById('order-items');
    const shippingNameElement = document.getElementById('shipping-name');
    const shippingPhoneElement = document.getElementById('shipping-phone');
    const shippingLocationElement = document.getElementById('shipping-location');
    
    // Get the order ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    // Update cart count
    updateCartCount();
    
    // Load order details
    if (orderId) {
        loadOrderDetails(orderId);
    } else {
        // If no order ID in URL, try to get the latest order
        loadLatestOrder();
    }
    
    function updateCartCount() {
        if (cartCountElement) {
            const cart = JSON.parse(localStorage.getItem('saporaBDCart')) || [];
            const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
            cartCountElement.textContent = itemCount;
        }
    }
    
    function loadOrderDetails(orderId) {
        // First try to get the order from the server
        fetch(`/api/orders/${orderId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Order not found on server');
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.order) {
                    // Convert server order format to local format if needed
                    const orderForDisplay = {
                        orderId: data.order.orderId,
                        orderDate: data.order.orderDate,
                        customer: {
                            name: data.order.customerName,
                            email: data.order.email,
                            phone: data.order.phone,
                            address: data.order.address,
                            district: data.order.district
                        },
                        items: data.order.items.map(item => ({
                            id: item.productId,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity
                        })),
                        shipping: {
                            method: data.order.shipping === SHIPPING_FEE_INSIDE_DHAKA ? 'inside-dhaka' : 'outside-dhaka',
                            cost: data.order.shipping
                        },
                        payment: {
                            method: data.order.paymentMethod,
                            transactionId: data.order.transactionId
                        }
                    };
                    
                    displayOrderDetails(orderForDisplay);
                } else {
                    throw new Error('Invalid order data from server');
                }
            })
            .catch(error => {
                console.log('Error fetching from server, trying localStorage:', error);
                
                // Fallback to localStorage if server request fails
                // Get orders from localStorage
                const orders = JSON.parse(localStorage.getItem('saporaBDOrders')) || [];
                
                // Find the specific order
                const order = orders.find(order => order.orderId === orderId);
                
                if (order) {
                    displayOrderDetails(order);
                } else {
                    showOrderNotFound();
                }
            });
    }
    
    function loadLatestOrder() {
        // First try to get the latest order from the server
        fetch('/api/orders/latest')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Could not fetch latest order from server');
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.order) {
                    // Convert server order format to local format if needed
                    const orderForDisplay = {
                        orderId: data.order.orderId,
                        orderDate: data.order.orderDate,
                        customer: {
                            name: data.order.customerName,
                            email: data.order.email,
                            phone: data.order.phone,
                            address: data.order.address,
                            district: data.order.district
                        },
                        items: data.order.items.map(item => ({
                            id: item.productId,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity
                        })),
                        shipping: {
                            method: data.order.shipping === SHIPPING_FEE_INSIDE_DHAKA ? 'inside-dhaka' : 'outside-dhaka',
                            cost: data.order.shipping
                        },
                        payment: {
                            method: data.order.paymentMethod,
                            transactionId: data.order.transactionId
                        }
                    };
                    
                    displayOrderDetails(orderForDisplay);
                } else {
                    throw new Error('Invalid order data from server');
                }
            })
            .catch(error => {
                console.log('Error fetching latest order from server, trying localStorage:', error);
                
                // Fallback to localStorage if server request fails
                // Get orders from localStorage
                const orders = JSON.parse(localStorage.getItem('saporaBDOrders')) || [];
                
                // Get the most recent order (last in the array)
                if (orders.length > 0) {
                    const latestOrder = orders[orders.length - 1];
                    displayOrderDetails(latestOrder);
                } else {
                    // If no orders yet, create some demo data
                    createDemoOrder();
                }
            });
    }
    
    function createDemoOrder() {
        // Create demo data for display
        fetch('products.json')
            .then(response => response.json())
            .then(products => {
                const demoOrder = {
                    orderId: 'BD-' + Math.floor(100000 + Math.random() * 900000),
                    orderDate: new Date().toISOString(),
                    customer: {
                        name: 'Sadik Ahmed',
                        phone: '01920373773',
                        address: 'Ajeb',
                        district: 'Dhaka'
                    },
                    items: [
                        {
                            id: products[0].id,
                            name: products[0].name,
                            price: products[0].price,
                            quantity: 1
                        },
                        {
                            id: products[1].id,
                            name: products[1].name,
                            price: products[1].price,
                            quantity: 1
                        }
                    ],
                    shipping: {
                        method: 'inside-dhaka',
                        cost: 0 // Free shipping
                    },
                    payment: {
                        method: 'cod'
                    }
                };
                
                displayOrderDetails(demoOrder);
            })
            .catch(error => {
                console.error('Error creating demo order:', error);
                showOrderNotFound();
            });
    }
    
    function displayOrderDetails(order) {
        // Format date
        const orderDate = new Date(order.orderDate);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Update order information
        if (orderDateElement) orderDateElement.textContent = formattedDate;
        
        // Update payment method
        const paymentMethodText = order.payment.method === 'cod' ? 'Cash on delivery' : 
                                  order.payment.method === 'bkash' ? 'bKash Payment' : 'Online Payment';
        
        if (paymentMethodElement) paymentMethodElement.textContent = paymentMethodText;
        if (paymentMethodRowElement) paymentMethodRowElement.textContent = paymentMethodText;
        
        // Display order items
        if (orderItemsContainer) {
            orderItemsContainer.innerHTML = '';
            
            if (!order.items || order.items.length === 0) {
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = '<td colspan="2" class="py-4 text-center text-gray-500">No items in this order</td>';
                orderItemsContainer.appendChild(emptyRow);
            } else {
                order.items.forEach(item => {
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td>${item.name} × ${item.quantity}</td>
                        <td class="text-right">${formatPrice(item.price * item.quantity)}</td>
                    `;
                    
                    orderItemsContainer.appendChild(row);
                });
            }
        }
        
        // Calculate and display order totals
        const subtotal = order.items ? order.items.reduce((total, item) => total + (item.price * item.quantity), 0) : 0;
        const shipping = order.shipping && order.shipping.cost ? order.shipping.cost : 0;
        const total = subtotal + shipping;
        
        if (orderSubtotalElement) orderSubtotalElement.textContent = formatPrice(subtotal);
        
        if (orderShippingElement) {
            if (shipping === 0) {
                orderShippingElement.textContent = 'ফ্রি ডেলিভারি';
            } else {
                orderShippingElement.textContent = formatPrice(shipping);
            }
        }
        
        if (orderTotalElement) orderTotalElement.textContent = formatPrice(total);
        if (orderTotalRowElement) orderTotalRowElement.textContent = formatPrice(total);
        
        // Display shipping information
        if (shippingNameElement) shippingNameElement.textContent = order.customer.name;
        if (shippingPhoneElement) shippingPhoneElement.textContent = order.customer.phone;
        if (shippingLocationElement) shippingLocationElement.textContent = order.customer.address;
        
        // Display order notes if available
        const orderNotesSection = document.getElementById('order-notes-section');
        const orderNotesElement = document.getElementById('order-notes');
        
        if (orderNotesSection && orderNotesElement && order.notes && order.notes.trim() !== '') {
            orderNotesSection.classList.remove('hidden');
            orderNotesElement.textContent = order.notes;
        } else if (orderNotesSection) {
            orderNotesSection.classList.add('hidden');
        }
    }
    
    function showOrderNotFound() {
        const contentContainer = document.querySelector('.container.mx-auto.px-4.py-12');
        
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="max-w-3xl mx-auto">
                    <!-- Success Message -->
                    <div class="success-message mb-8">
                        <p class="text-yellow-600 text-lg font-medium">Order Not Found</p>
                    </div>
                    
                    <div class="bg-white shadow-sm rounded-lg overflow-hidden p-8 text-center">
                        <div class="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                            <i class="fas fa-exclamation-triangle text-4xl text-yellow-500"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-gray-800">Order Not Found</h1>
                        <p class="text-gray-600 mt-4 mb-8">We couldn't find the order you're looking for.</p>
                        <a href="shop.html" class="inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md font-medium">
                            Go Shopping
                        </a>
                    </div>
                </div>
            `;
        }
    }
    
    function formatPrice(price) {
        return `${price}৳`;
    }
}); 