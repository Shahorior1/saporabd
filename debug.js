// Debug script to fix cart functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Debug script loaded!');
    
    // Check if we're on the shop page
    if (window.location.pathname.includes('shop.html')) {
        console.log('Currently on shop page - setting up debug listeners');
        setupShopDebug();
    }
    
    function setupShopDebug() {
        // Wait a bit to ensure the shop.js has initialized
        setTimeout(() => {
            // Log all product cards
            const productCards = document.querySelectorAll('.product-card');
            console.log(`Found ${productCards.length} product cards on shop page`);
            
            // Check "Add to Cart" buttons
            const addToCartButtons = document.querySelectorAll('button');
            console.log(`Found ${addToCartButtons.length} total buttons`);
            
            const cartButtons = Array.from(addToCartButtons).filter(btn => 
                btn.textContent.trim() === 'Add to Cart'
            );
            console.log(`Found ${cartButtons.length} "Add to Cart" buttons`);
            
            // Add our own event listeners to "Add to Cart" buttons
            cartButtons.forEach((btn, index) => {
                console.log(`Button ${index} HTML:`, btn.outerHTML);
                
                // Remove existing listeners
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                // Add our debug listener
                newBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Debug: Add to Cart button clicked');
                    
                    const productCard = this.closest('.product-card');
                    if (!productCard) {
                        console.error('Debug: Cannot find product card');
                        return;
                    }
                    
                    // Get product info
                    const name = productCard.querySelector('h3').textContent;
                    const priceText = productCard.querySelector('.text-green-600').textContent;
                    // Clean up price text and extract number
                    const price = parseInt(priceText.replace(/[^\d]/g, ''));
                    const image = productCard.querySelector('img').src;
                    
                    console.log('Debug: Product info:', {
                        name,
                        price,
                        image
                    });
                    
                    // Create cart item
                    const cartItem = {
                        id: Date.now(), // Use timestamp as ID
                        name: name,
                        price: price,
                        image: image,
                        quantity: 1,
                        inStock: true
                    };
                    
                    // Add to cart
                    addToLocalStorageCart(cartItem);
                    
                    // Show feedback
                    showFeedback(this);
                });
            });
            
            // Log current cart contents
            const currentCart = JSON.parse(localStorage.getItem('saporaBDCart')) || [];
            console.log('Current cart contents:', currentCart);
        }, 1000);
    }
    
    function addToLocalStorageCart(item) {
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
            
            console.log('Debug: Current cart before adding:', cart);
            
            // Check if product already exists (by name since we generate IDs)
            const existingItemIndex = cart.findIndex(cartItem => cartItem.name === item.name);
            
            if (existingItemIndex !== -1) {
                // Update quantity
                cart[existingItemIndex].quantity += 1;
                console.log(`Debug: Updated quantity for ${item.name}`);
            } else {
                // Add new item
                cart.push(item);
                console.log(`Debug: Added new item ${item.name} to cart`);
            }
            
            // Save to localStorage
            localStorage.setItem('saporaBDCart', JSON.stringify(cart));
            console.log('Debug: Updated cart saved to localStorage');
            
            // Update cart count if the function exists
            if (typeof updateCartCount === 'function') {
                updateCartCount();
                console.log('Debug: Called updateCartCount function');
            } else {
                console.warn('Debug: updateCartCount function not found');
                // Fallback update of cart count
                const cartCountElement = document.getElementById('cart-count');
                if (cartCountElement) {
                    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
                    cartCountElement.textContent = itemCount;
                    console.log(`Debug: Updated cart count to ${itemCount}`);
                }
            }
            
            // Show notification if the function exists
            if (typeof showNotification === 'function') {
                showNotification(`${item.name} added to cart`, 'success');
                console.log('Debug: Called showNotification function');
            } else {
                console.warn('Debug: showNotification function not found');
            }
            
            return true;
        } catch (error) {
            console.error('Debug: Error in addToLocalStorageCart:', error);
            return false;
        }
    }
    
    function showFeedback(button) {
        // Save original state
        const originalText = button.textContent;
        const originalBg = button.style.backgroundColor;
        const originalColor = button.style.color;
        
        // Change appearance
        button.textContent = '✓ Added to cart';
        button.style.backgroundColor = '#10B981'; // green
        button.style.color = 'white';
        
        // Restore after delay
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = originalBg;
            button.style.color = originalColor;
        }, 1500);
    }
    
    // Define global functions if needed
    window.debugAddToCart = addToLocalStorageCart;
}); 