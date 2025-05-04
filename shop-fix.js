// Fix for the "Add to Cart" functionality in shop.js
(function() {
    console.log('Shop fix script loaded!');

    // Wait for shop.js to initialize
    document.addEventListener('DOMContentLoaded', function() {
        // Wait a bit to ensure the DOM is fully loaded
        setTimeout(function() {
            console.log('Applying fix for Add to Cart functionality');
            fixAddToCartFunctionality();
        }, 500);
    });

    function fixAddToCartFunctionality() {
        // Find all "Add to Cart" buttons
        const addToCartButtons = document.querySelectorAll('.product-card button');
        console.log(`Found ${addToCartButtons.length} buttons in product cards`);

        // Remove any existing event listeners and add our fixed ones
        addToCartButtons.forEach(button => {
            if (button.textContent.trim() === 'Add to Cart') {
                console.log('Found an "Add to Cart" button:', button);
                
                // Create a new button to replace the old one (removes event listeners)
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // Add our fixed event listener
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Fixed Add to Cart button clicked');
                    
                    // Find the product card
                    const productCard = this.closest('.product-card');
                    if (!productCard) {
                        console.error('Cannot find product card');
                        return;
                    }
                    
                    // Extract product info
                    const name = productCard.querySelector('h3').textContent;
                    let priceText = productCard.querySelector('.text-green-600').textContent;
                    // Extract price (remove currency symbol and other characters)
                    const price = parseInt(priceText.replace(/[^\d]/g, ''));
                    const image = productCard.querySelector('img').src;
                    
                    console.log('Product info:', { name, price, image });
                    
                    // Create a cart item object
                    const cartItem = {
                        id: Date.now(), // Use timestamp as unique ID
                        name: name,
                        price: price,
                        image: image,
                        quantity: 1,
                        inStock: true
                    };
                    
                    // Add to cart
                    addToCart(cartItem);
                    
                    // Show feedback
                    showButtonFeedback(this);
                });
            }
        });
    }
    
    function addToCart(item) {
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
            
            // Check if item already exists in cart (by name)
            const existingItemIndex = cart.findIndex(cartItem => cartItem.name === item.name);
            
            if (existingItemIndex !== -1) {
                // Update quantity
                cart[existingItemIndex].quantity += 1;
                showNotification(`${item.name} quantity updated in cart`, 'success');
            } else {
                // Add new item
                cart.push(item);
                showNotification(`${item.name} added to cart`, 'success');
            }
            
            // Save to localStorage
            localStorage.setItem('saporaBDCart', JSON.stringify(cart));
            
            // Update cart count in header
            updateCartCount();
            
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification('Error adding to cart', 'error');
            return false;
        }
    }
    
    function showButtonFeedback(button) {
        // Store original button appearance
        const originalText = button.textContent;
        const originalBg = button.style.backgroundColor;
        const originalColor = button.style.color;
        
        // Change appearance
        button.textContent = '✓ Added to cart';
        button.style.backgroundColor = '#10B981'; // green-500 color
        button.style.color = 'white';
        
        // Restore original appearance after delay
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = originalBg;
            button.style.color = originalColor;
        }, 1500);
    }
    
    function showNotification(message, type = 'success') {
        // Use window.showNotification if available
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
            return;
        }
        
        // Create our own notification container if needed
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'fixed bottom-4 right-4 z-50 flex flex-col space-y-2';
            document.body.appendChild(container);
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'bg-white border-l-4 p-3 rounded shadow-md min-w-[200px] max-w-[300px]';
        
        // Set color based on type
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
    
    function updateCartCount() {
        // Use window.updateCartCount if available
        if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
            return;
        }
        
        // Otherwise, implement our own version
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            const cart = JSON.parse(localStorage.getItem('saporaBDCart')) || [];
            const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
            cartCountElement.textContent = itemCount;
        }
    }
    
    // Store references to the fixed functions globally
    window.fixedAddToCart = addToCart;
    window.fixedShowNotification = showNotification;
    window.fixedUpdateCartCount = updateCartCount;
})(); 