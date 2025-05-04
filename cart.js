// Cart functionality for Sapora BD
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartItemTemplate = document.getElementById('cart-item-template');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartCountElement = document.getElementById('cart-count');
    const subtotalElement = document.getElementById('cart-subtotal');
    const totalElement = document.getElementById('cart-total');
    const clearCartButton = document.getElementById('clear-cart');
    const checkoutButton = document.getElementById('checkout-button');
    const recommendedProductsContainer = document.getElementById('recommended-products');
    const couponCodeInput = document.getElementById('coupon-code');
    const applyCouponButton = document.getElementById('apply-coupon');
    const shippingInsideRadio = document.getElementById('shipping-inside');
    const shippingOutsideRadio = document.getElementById('shipping-outside');
    const shippingLocationElement = document.getElementById('shipping-location');
    const changeAddressLink = document.getElementById('change-address');
    const discountElement = document.getElementById('cart-discount');
    const shippingElement = document.getElementById('cart-shipping');

    // Shipping fee
    const SHIPPING_FEE_INSIDE_DHAKA = 80;
    const SHIPPING_FEE_OUTSIDE_DHAKA = 60;
    
    // Add notification container to the page
    if (typeof createNotificationContainer === 'function') {
        createNotificationContainer();
    } else {
        // Define our own if the global one isn't available
        createLocalNotificationContainer();
    }
    
    // Get cart from localStorage or initialize empty cart
    let cart = JSON.parse(localStorage.getItem('saporaBDCart')) || [];
    console.log('Cart loaded from localStorage:', cart);
    
    // Check if cart is empty and add sample items if needed (for demo purposes)
    if (cart.length === 0) {
        // Load the products.json data
        fetch('products.json')
            .then(response => response.json())
            .then(products => {
                // Add the first two products to the cart for demo
                cart.push({
                    id: products[0].id,
                    name: products[0].name,
                    price: products[0].price,
                    image: products[0].image,
                    quantity: 1
                });
                
                cart.push({
                    id: products[1].id,
                    name: products[1].name,
                    price: products[1].price,
                    image: products[1].image,
                    quantity: 1
                });
                
                // Save to localStorage
                localStorage.setItem('saporaBDCart', JSON.stringify(cart));
                
                // Initialize cart
                initCart();
            })
            .catch(error => {
                console.error('Error loading products:', error);
                initCart();
            });
    } else {
        // Initialize cart
        initCart();
    }
    
    loadRecommendedProducts();
    
    function initCart() {
        updateCartCount();
        renderCartItems();
        updateCartSummary();
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Clear cart button
        if (clearCartButton) {
            clearCartButton.addEventListener('click', function() {
                if (confirm('Are you sure you want to clear your cart?')) {
                    clearCart();
                    showNotification('Cart cleared successfully');
                }
            });
        }
        
        // Checkout button
        if (checkoutButton) {
            checkoutButton.addEventListener('click', function() {
                // Go to checkout page
                window.location.href = 'checkout.html';
            });
        }
        
        // Apply coupon
        if (applyCouponButton && couponCodeInput) {
            applyCouponButton.addEventListener('click', function() {
                const couponCode = couponCodeInput.value.trim();
                if (couponCode) {
                    // In a real app, this would validate the coupon with the backend
                    if (couponCode === 'SAVE10') {
                        showNotification('Coupon applied: 10% discount!', 'success');
                        updateCartSummary(10); // 10% discount
                    } else {
                        showNotification('Invalid coupon code', 'error');
                    }
                } else {
                    showNotification('Please enter a coupon code', 'info');
                }
            });
        }
        
        // Shipping options
        if (shippingInsideRadio && shippingOutsideRadio) {
            shippingInsideRadio.addEventListener('change', function() {
                updateCartSummary();
            });
            
            shippingOutsideRadio.addEventListener('change', function() {
                updateCartSummary();
            });
        }
    }
    
    function updateCartCount() {
        if (cartCountElement) {
            const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
            cartCountElement.textContent = itemCount;
            
            // Add animation to cart count
            cartCountElement.classList.add('pulse-animation');
            setTimeout(() => {
                cartCountElement.classList.remove('pulse-animation');
            }, 700);
            
            // Update checkout button state
            if (checkoutButton) {
                if (itemCount === 0) {
                    checkoutButton.disabled = true;
                    checkoutButton.classList.add('opacity-50', 'cursor-not-allowed');
                } else {
                    checkoutButton.disabled = false;
                    checkoutButton.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            }
        }
    }
    
    function renderCartItems() {
        if (!cartItemsContainer) {
            console.error('Cart items container not found');
            return;
        }
        
        // Show empty cart message if cart is empty
        if (cart.length === 0) {
            if (emptyCartMessage) {
                emptyCartMessage.style.display = 'block';
            }
            cartItemsContainer.innerHTML = '';
            return;
        }
        
        // Hide empty cart message
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'none';
        }
        
        // Clear existing items
        cartItemsContainer.innerHTML = '';
        
        // Add each cart item
        cart.forEach(item => {
            // Create cart item element
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item flex items-center border-b border-gray-200 py-4';
            cartItemElement.dataset.itemId = item.id;
            
            // Build the cart item HTML
            cartItemElement.innerHTML = `
                <button class="remove-item text-gray-400 hover:text-red-500 mr-3">
                    <i class="fas fa-times"></i>
                </button>
                <div class="w-16 h-16 flex-shrink-0">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded">
                </div>
                <div class="ml-4 flex-grow">
                    <h3 class="font-medium">${item.name}</h3>
                </div>
                <div class="flex items-center mx-2">
                    <button class="decrease-quantity px-2 py-1 border border-gray-300 rounded-l">
                        -
                    </button>
                    <input type="number" value="${item.quantity}" min="1" 
                        class="item-quantity w-12 border-t border-b border-gray-300 text-center py-1"
                        readonly>
                    <button class="increase-quantity px-2 py-1 border border-gray-300 rounded-r">
                        +
                    </button>
                </div>
                <div class="ml-4 text-right">
                    <span class="item-subtotal font-medium">${item.quantity} × ${formatPrice(item.price)}</span>
                </div>
            `;
            
            // Add event listeners
            const removeButton = cartItemElement.querySelector('.remove-item');
            const decreaseButton = cartItemElement.querySelector('.decrease-quantity');
            const increaseButton = cartItemElement.querySelector('.increase-quantity');
            const quantityInput = cartItemElement.querySelector('.item-quantity');
            
            removeButton.addEventListener('click', () => removeFromCart(item.id));
            decreaseButton.addEventListener('click', () => updateItemQuantity(item.id, item.quantity - 1));
            increaseButton.addEventListener('click', () => updateItemQuantity(item.id, item.quantity + 1));
            quantityInput.addEventListener('change', (e) => {
                const quantity = parseInt(e.target.value);
                if (quantity > 0) {
                    updateItemQuantity(item.id, quantity);
                } else {
                    e.target.value = item.quantity;
                }
            });
            
            cartItemsContainer.appendChild(cartItemElement);
        });
    }
    
    function removeFromCart(itemId) {
        const removedItem = cart.find(item => item.id == itemId);
        if (removedItem) {
            cart = cart.filter(item => item.id != itemId);
            localStorage.setItem('saporaBDCart', JSON.stringify(cart));
            
            renderCartItems();
            updateCartCount();
            updateCartSummary();
            
            showNotification(`Removed ${removedItem.name} from cart`);
        }
    }
    
    function updateItemQuantity(itemId, quantity) {
        const itemIndex = cart.findIndex(item => item.id == itemId);
        
        if (itemIndex !== -1) {
            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                removeFromCart(itemId);
                return;
            }
            
            cart[itemIndex].quantity = quantity;
            localStorage.setItem('saporaBDCart', JSON.stringify(cart));
            
            // Update display
            renderCartItems();
            updateCartCount();
            updateCartSummary();
        }
    }
    
    function updateCartSummary(discountPercent = 0) {
        if (!subtotalElement || !totalElement) {
            return;
        }
        
        // Calculate subtotal
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Calculate shipping
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
        subtotalElement.textContent = formatPrice(subtotal);
        
        if (shippingElement) {
            shippingElement.textContent = formatPrice(shipping);
        }
        
        if (discountElement && discountPercent > 0) {
            discountElement.textContent = `-${formatPrice(discount)}`;
            discountElement.parentElement.classList.remove('hidden');
        } else if (discountElement) {
            discountElement.parentElement.classList.add('hidden');
        }
        
        totalElement.textContent = formatPrice(total);
    }
    
    function clearCart() {
        cart = [];
        localStorage.setItem('saporaBDCart', JSON.stringify(cart));
        
        renderCartItems();
        updateCartCount();
        updateCartSummary();
    }
    
    function loadRecommendedProducts() {
        if (!recommendedProductsContainer) {
            return;
        }
        
        // Fetch products from JSON
        fetch('products.json')
            .then(response => response.json())
            .then(products => {
                // Filter out products already in cart
                const cartProductIds = cart.map(item => item.id);
                const availableProducts = products.filter(product => !cartProductIds.includes(product.id));
                
                // Get up to 4 random products for recommendations
                const recommendedProducts = availableProducts
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 4);
                
                // Clear the container
                recommendedProductsContainer.innerHTML = '';
                
                // Add each recommended product
                recommendedProducts.forEach(product => {
                    const productElement = document.createElement('div');
                    productElement.className = 'recommended-product bg-white rounded-lg shadow-sm p-4';
                    
                    productElement.innerHTML = `
                        <div class="relative pb-3/4">
                            <img src="${product.image}" alt="${product.name}" 
                                class="absolute inset-0 w-full h-full object-cover rounded-md">
                        </div>
                        <h3 class="font-medium mt-2">${product.name}</h3>
                        <div class="flex justify-between items-center mt-2">
                            <span class="text-green-600 font-medium">${formatPrice(product.price)}</span>
                            <button class="add-to-cart bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                                data-product-id="${product.id}">
                                Add to Cart
                            </button>
                        </div>
                    `;
                    
                    // Add event listener to the Add to Cart button
                    const addToCartButton = productElement.querySelector('.add-to-cart');
                    addToCartButton.addEventListener('click', () => {
                        addProductToCart(product);
                        showAddedToCartFeedback(addToCartButton, product.name);
                    });
                    
                    recommendedProductsContainer.appendChild(productElement);
                });
            })
            .catch(error => {
                console.error('Error loading recommended products:', error);
                recommendedProductsContainer.innerHTML = '<p class="text-gray-500">Failed to load recommended products.</p>';
            });
    }
    
    function addProductToCart(product) {
        // Check if product already exists in cart
        const existingItemIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingItemIndex !== -1) {
            // Increment quantity if product already in cart
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new product to cart
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        // Save to localStorage
        localStorage.setItem('saporaBDCart', JSON.stringify(cart));
        
        // Update cart display
        renderCartItems();
        updateCartCount();
        updateCartSummary();
        
        // Update recommendations (to remove added product)
        loadRecommendedProducts();
    }
    
    function showAddedToCartFeedback(button, productName) {
        // Store original text
        const originalText = button.textContent;
        // Change button text and style
        button.textContent = '✓ Added';
        button.classList.remove('bg-green-500', 'hover:bg-green-600');
        button.classList.add('bg-green-700');
        
        // Show notification
        showNotification(`Added ${productName} to cart`);
        
        // Restore button after delay
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.add('bg-green-500', 'hover:bg-green-600');
            button.classList.remove('bg-green-700');
        }, 2000);
    }
    
    function createLocalNotificationContainer() {
        if (document.getElementById('notification-container')) {
            return;
        }
        
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'fixed top-4 right-4 z-50 flex flex-col items-end space-y-2';
        document.body.appendChild(container);
    }
    
    function showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        
        if (!container) {
            console.error('Notification container not found');
            return;
        }
        
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
    
    function formatPrice(price) {
        return `${price}৳`;
    }
    
    function parsePrice(priceString) {
        return Number(priceString.replace(/[^0-9.-]+/g, ''));
    }
}); 