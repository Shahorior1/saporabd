// Main script for Sapora BD website
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart count display
    updateCartCount();
    
    // Setup cart functionality for home page
    setupHomePageCart();
    
    // Update cart count display
    function updateCartCount() {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            // Get cart from localStorage
            const cart = JSON.parse(localStorage.getItem('saporaBDCart')) || [];
            // Calculate total quantity
            const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
            // Update display
            cartCountElement.textContent = itemCount;
            
            // Add pulse animation
            cartCountElement.classList.add('pulse-animation');
            setTimeout(() => {
                cartCountElement.classList.remove('pulse-animation');
            }, 700);
        }
    }
    
    // Setup add to cart buttons on home page
    function setupHomePageCart() {
        const productCards = document.querySelectorAll('.product-card');
        console.log('Found', productCards.length, 'product cards on home page');
        
        productCards.forEach(card => {
            const addToCartBtn = card.querySelector('button');
            if (addToCartBtn && addToCartBtn.textContent.trim() === 'Add to Cart') {
                // Remove previous event listeners
                const newButton = addToCartBtn.cloneNode(true);
                addToCartBtn.parentNode.replaceChild(newButton, addToCartBtn);
                
                // Add new event listener
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Add to Cart clicked on home page');
                    
                    // Extract product info
                    const name = card.querySelector('h3').textContent;
                    let priceText = card.querySelector('.text-green-600').textContent;
                    // Remove non-numeric characters except first numbers
                    priceText = priceText.replace('৳', '').replace(/[^0-9.]/g, '').trim();
                    const price = parseInt(priceText);
                    const image = card.querySelector('img').src;
                    
                    // Create product object
                    const product = {
                        id: Date.now(), // Generate unique ID
                        name: name,
                        price: price,
                        image: image,
                        quantity: 1,
                        inStock: true
                    };
                    
                    console.log('Adding product to cart:', product);
                    
                    // Add to cart in localStorage
                    addToCart(product);
                    
                    // Show feedback
                    showButtonFeedback(this, 'Added to cart');
                });
            }
        });
    }
    
    // Add product to cart
    function addToCart(product) {
        try {
            // Get current cart
            let cart = [];
            try {
                const cartData = localStorage.getItem('saporaBDCart');
                cart = cartData ? JSON.parse(cartData) : [];
            } catch (e) {
                console.error('Error parsing cart data:', e);
                cart = [];
            }
            
            // Check if product already exists (by name since we generate IDs)
            const existingItemIndex = cart.findIndex(item => item.name === product.name);
            
            if (existingItemIndex !== -1) {
                // Update quantity
                cart[existingItemIndex].quantity += 1;
                showNotification(`${product.name} quantity updated in cart`, 'success');
            } else {
                // Add new item
                cart.push(product);
                showNotification(`${product.name} added to cart`, 'success');
            }
            
            // Save to localStorage
            localStorage.setItem('saporaBDCart', JSON.stringify(cart));
            
            // Update cart count display
            updateCartCount();
            
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification('Error adding to cart', 'error');
            return false;
        }
    }
    
    // Create notification container if it doesn't exist
    function createNotificationContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'fixed bottom-4 right-4 z-50 flex flex-col space-y-2';
            document.body.appendChild(container);
            
            // Add necessary CSS
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.3); }
                    100% { transform: scale(1); }
                }
                .notification {
                    animation: slideIn 0.3s ease-out forwards;
                }
                .notification.hide {
                    animation: slideOut 0.3s ease-in forwards;
                }
                .pulse-animation {
                    animation: pulse 0.7s ease-in-out;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Show notification
    function showNotification(message, type = 'success') {
        // Create container if needed
        createNotificationContainer();
        
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = 'notification bg-white border-l-4 p-3 rounded shadow-md min-w-[200px] max-w-[300px]';
        
        // Set border color based on type
        if (type === 'success') {
            notification.classList.add('border-green-500');
        } else if (type === 'error') {
            notification.classList.add('border-red-500');
        } else if (type === 'info') {
            notification.classList.add('border-blue-500');
        }
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle text-green-500' : type === 'error' ? 'fa-exclamation-circle text-red-500' : 'fa-info-circle text-blue-500'} mr-2"></i>
                <p class="text-sm">${message}</p>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Show button feedback
    function showButtonFeedback(button, text, color = '#10B981') {
        // Save original properties
        const originalText = button.textContent;
        const originalBg = button.style.backgroundColor;
        const originalColor = button.style.color;
        
        // Change button appearance
        button.textContent = `✓ ${text}`;
        button.style.backgroundColor = color;
        button.style.color = 'white';
        
        // Restore original appearance after delay
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = originalBg;
            button.style.color = originalColor;
        }, 1500);
    }
    
    // Expose functions globally
    window.updateCartCount = updateCartCount;
    window.addToCart = addToCart;
    window.showNotification = showNotification;
    window.showButtonFeedback = showButtonFeedback;
    window.createNotificationContainer = createNotificationContainer;
});