// Shop page functionality for Sapora BD
document.addEventListener('DOMContentLoaded', function() {
    // Product data - in a real application, this would come from a database
    const products = [
        {
            id: 1,
            name: "খেজুর গুড় ও নাট মিক্স কোকোনাট বরফি",
            category: "Others",
            price: 1300,
            image: "images/Khejur-gur.jpg",
            inStock: false,
            discount: null,
            tag: null,
            rating: 5
        },
        {
            id: 2,
            name: "গ্রামীন পিঠার ২ কেজির কম্বো প্যাক – মিষ্টি ছাড়া",
            category: "Others",
            price: 1300,
            image: "images/Gramin-pitha-2kg-pack.jpg",
            inStock: true,
            discount: 19,
            originalPrice: 1600,
            tag: "combo",
            rating: 4
        },
        {
            id: 3,
            name: "ঝিনুক পিঠা ১ কেজি",
            category: "pitha",
            price: 700,
            image: "images/Jhinuk-pitha-1kg.jpg",
            inStock: true,
            discount: null,
            tag: null,
            rating: 5
        },
        {
            id: 4,
            name: "তেঁতুলের আচার 400 গ্রাম",
            category: "chatni",
            price: 399,
            image: "images/tetuler-acar-400grm.jpg",
            inStock: true,
            discount: null,
            tag: "popular",
            rating: 4
        },
        {
            id: 5,
            name: "নকশি পিঠা ১ কেজি",
            category: "pitha",
            price: 700,
            image: "images/Nokshi-pitha.jpg",
            inStock: true,
            discount: null,
            tag: null,
            rating: 3
        },
        {
            id: 6,
            name: "নকশি পিঠা কম্বো",
            category: "pitha",
            price: 1350,
            image: "images/Nokshi-pitha-combo.jpg",
            inStock: false,
            discount: null,
            tag: "combo",
            rating: 4
        },
        {
            id: 7,
            name: "পনির প্রতি কেজি",
            category: "Others",
            price: 1499,
            image: "images/Panir-hafkg.jpg",
            inStock: false,
            discount: null,
            tag: "ponir",
            rating: 5
        },
        {
            id: 8,
            name: "পনির হাফ কেজি",
            category: "Others",
            price: 800,
            image: "images/Panir-hafkg.jpg",
            inStock: true,
            discount: null,
            tag: "ponir",
            rating: 4
        },
        {
            id: 9,
            name: "পুটিমাছের চ্যাঁপা",
            category: "Others",
            price: 1999,
            image: "images/putimach.jpg",
            inStock: true,
            discount: null,
            tag: null,
            rating: 4
        },
        {
            id: 10,
            name: "বাঁশপাতা চ্যাঁপা",
            category: "Others",
            price: 1299,
            image: "images/Bashpata-campa.jpg",
            inStock: true,
            discount: null,
            tag: "organic",
            rating: 3
        },
        {
            id: 11,
            name: "বাঁশপাতা চ্যাঁপা – 500 GM + পুটিমাছের চ্যাঁপা- 500 GM",
            category: "Others",
            price: 1599,
            image: "images/Bashpata-campa-1.jpg",
            inStock: true,
            discount: null,
            tag: "combo",
            rating: 4
        },
        {
            id: 12,
            name: "হাতে কাটা সেমাই",
            category: "Others",
            price: 799,
            image: "images/hate-kata-shemai-1.jpeg.jpg",
            inStock: true,
            discount: null,
            tag: "new",
            rating: 5
        }
    ];

    const productsContainer = document.getElementById('products-container');
    const productCountElement = document.getElementById('product-count');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const sortSelect = document.getElementById('sort-select');
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    const filterButton = document.getElementById('filter-button');
    const clearFiltersButton = document.getElementById('clear-filters-button');
    const inStockCheckbox = document.getElementById('in-stock');
    const outOfStockCheckbox = document.getElementById('out-of-stock');
    const categoryFilters = document.querySelectorAll('#category-filters input');
    const ratingFilters = document.querySelectorAll('input[id^="rating-"]');
    const tagFilters = document.querySelectorAll('.tag-filter');

    // Setup notification container if it doesn't exist
    createNotificationContainer();

    // Current filter state
    let currentFilters = {
        search: '',
        maxPrice: 2000,
        categories: ['all'],
        inStock: true,
        outOfStock: false,
        ratings: [],
        tags: [],
        sortBy: 'featured'
    };

    // Check if category is specified in URL
    function getUrlParameters() {
        const params = new URLSearchParams(window.location.search);
        return {
            category: params.get('category'),
            tag: params.get('tag'),
            search: params.get('search')
        };
    }

    // Initialize the page
    init();

    function init() {
        // Check URL parameters
        const urlParams = getUrlParameters();
        
        // Initialize cart count
        updateCartCount();
        
        // If category is specified in URL, apply it
        if (urlParams.category) {
            // Uncheck "all" category
            document.querySelector('#category-filters input[value="all"]').checked = false;
            
            // Find and check the matching category
            const categoryCheckbox = document.querySelector(`#category-filters input[value="${urlParams.category}"]`);
            if (categoryCheckbox) {
                categoryCheckbox.checked = true;
                currentFilters.categories = [urlParams.category];
                
                // Highlight the category card in the Shop by Category section
                const categoryCard = document.querySelector(`.category-card[href="?category=${urlParams.category}"]`);
                if (categoryCard) {
                    document.querySelectorAll('.category-card').forEach(card => {
                        card.classList.remove('ring-2', 'ring-green-500');
                    });
                    categoryCard.classList.add('ring-2', 'ring-green-500');
                }
            } else {
                // If category from URL doesn't match any checkbox, add it to filters anyway
                currentFilters.categories = [urlParams.category];
            }
        }
        
        // If tag is specified in URL, apply it
        if (urlParams.tag) {
            const tagButton = document.querySelector(`.tag-filter[data-tag="${urlParams.tag}"]`);
            if (tagButton) {
                tagButton.classList.add('bg-green-500', 'text-white', 'border-green-500');
                currentFilters.tags = [urlParams.tag];
            } else {
                currentFilters.tags = [urlParams.tag];
            }
        }
        
        // If search is specified in URL, apply it
        if (urlParams.search) {
            searchInput.value = urlParams.search;
            currentFilters.search = urlParams.search;
        }
        
        // Setup event listeners for interactive elements
        setupEventListeners();
        
        // Apply current filters and render products
        renderProducts(filterProducts(products));
        
        // Setup hover/click effects for product cards
        setupProductInteractions();
        
        // Highlight "View All Categories" button if no specific filters are active
        updateViewAllCategoriesButtonState();
    }

    function setupEventListeners() {
        // Search functionality
        searchButton.addEventListener('click', function() {
            const searchTerm = searchInput.value.trim().toLowerCase();
            console.log('Search button clicked. Search term:', searchTerm);
            
            // Update filter
            currentFilters.search = searchTerm;
            
            // Update URL with search parameter
            updateUrlParams();
            
            // Show notification
            if (searchTerm) {
                showNotification(`Searching for: "${searchTerm}"`, 'info');
            } else if (currentFilters.search && !searchTerm) {
                showNotification('Search cleared', 'info');
            }
            
            // Render filtered products
            renderProducts(filterProducts(products));
            updateViewAllCategoriesButtonState();
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.trim().toLowerCase();
                console.log('Search input Enter key pressed. Search term:', searchTerm);
                
                // Update filter
                currentFilters.search = searchTerm;
                
                // Update URL with search parameter
                updateUrlParams();
                
                // Show notification
                if (searchTerm) {
                    showNotification(`Searching for: "${searchTerm}"`, 'info');
                } else if (currentFilters.search && !searchTerm) {
                    showNotification('Search cleared', 'info');
                }
                
                // Render filtered products
                renderProducts(filterProducts(products));
                updateViewAllCategoriesButtonState();
            }
        });

        // Header View All Categories link
        const headerViewAllLink = document.getElementById('header-view-all');
        if (headerViewAllLink) {
            headerViewAllLink.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Header View All Categories link clicked!');
                
                // Directly implement the same functionality as View All Categories button
                resetAllFilters();
            });
        }

        // Shop by Category section's View All Categories button
        const shopViewAllBtn = document.getElementById('shop-view-all');
        if (shopViewAllBtn) {
            shopViewAllBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Shop by Category View All button clicked!');
                
                // Reset all filters and show all products
                resetAllFilters();
            });
        }

        // View All Categories button
        const viewAllCategoriesBtn = document.getElementById('view-all-categories');
        if (viewAllCategoriesBtn) {
            viewAllCategoriesBtn.addEventListener('click', function() {
                console.log('View All Categories button clicked!');
                
                // Reset all filters
                resetAllFilters();
            });
        }
        
        // Function to reset all filters and show all products
        function resetAllFilters() {
            // Reset all filters
            currentFilters.search = '';
            searchInput.value = '';
            
            // Reset price range
            currentFilters.maxPrice = 2000;
            priceRange.value = 2000;
            priceValue.textContent = '2000৳';
            
            // Reset categories - ensure "all" is selected and others are unchecked
            currentFilters.categories = ['all'];
            categoryFilters.forEach(filter => {
                if (filter.value === 'all') {
                    filter.checked = true;
                } else {
                    filter.checked = false;
                }
            });
            
            // Reset category card highlighting in the Shop by Category section
            document.querySelectorAll('.category-card').forEach(card => {
                card.classList.remove('ring-2', 'ring-green-500');
            });
            
            // Reset stock filters - show both in-stock and out-of-stock products
            currentFilters.inStock = true;
            currentFilters.outOfStock = true;
            inStockCheckbox.checked = true;
            outOfStockCheckbox.checked = true;
            
            // Reset rating filters
            currentFilters.ratings = [];
            ratingFilters.forEach(filter => {
                filter.checked = false;
            });
            
            // Reset tag filters
            currentFilters.tags = [];
            tagFilters.forEach(button => {
                button.classList.remove('bg-green-500', 'text-white', 'border-green-500');
            });
            
            // Reset sort option
            currentFilters.sortBy = 'featured';
            sortSelect.value = 'featured';
            
            // Update URL to remove all parameters
            history.pushState({}, '', 'shop.html');
            
            // Show notification
            showNotification('Showing all products', 'success');
            
            // Render all products
            renderProducts(filterProducts(products));
            
            // Update button state
            updateViewAllCategoriesButtonState();
            
            // Scroll to products section
            document.querySelector('#products-container').scrollIntoView({ behavior: 'smooth' });
        }

        // Sort functionality
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            console.log('Sort selection changed to:', sortValue);
            
            // Update filter
            currentFilters.sortBy = sortValue;
            
            // Show notification
            let sortMessage = '';
            switch(sortValue) {
                case 'price-low':
                    sortMessage = 'Products sorted by price: low to high';
                    break;
                case 'price-high':
                    sortMessage = 'Products sorted by price: high to low';
                    break;
                case 'name-asc':
                    sortMessage = 'Products sorted by name: A to Z';
                    break;
                case 'name-desc':
                    sortMessage = 'Products sorted by name: Z to A';
                    break;
                default:
                    sortMessage = 'Products sorted by featured';
                    break;
            }
            showNotification(sortMessage, 'info');
            
            // Render sorted products
            renderProducts(filterProducts(products));
            updateViewAllCategoriesButtonState();
        });

        // Price range input
        priceRange.addEventListener('input', function() {
            priceValue.textContent = this.value + '৳';
        });

        // Apply filters button
        filterButton.addEventListener('click', function() {
            console.log('Apply filter button clicked. Price range:', priceRange.value);
            
            // Update price filter
            currentFilters.maxPrice = parseInt(priceRange.value);
            
            // Show notification
            showNotification(`Price filter applied: 0-${currentFilters.maxPrice}৳`, 'success');
            
            // Render filtered products
            renderProducts(filterProducts(products));
            
            // Update button state
            updateViewAllCategoriesButtonState();
        });
        
        // Clear All Filters button
        clearFiltersButton.addEventListener('click', function() {
            console.log('Clear All Filters button clicked');
            
            // Reset all filters by calling the existing resetAllFilters function
            resetAllFilters();
            
            // Show notification
            showNotification('All filters cleared', 'success');
        });

        // Stock filters
        inStockCheckbox.addEventListener('change', function() {
            console.log('In-stock checkbox changed:', this.checked);
            
            // Update filter
            currentFilters.inStock = this.checked;
            
            // If both stock filters are unchecked, check both (show all)
            if (!inStockCheckbox.checked && !outOfStockCheckbox.checked) {
                inStockCheckbox.checked = true;
                outOfStockCheckbox.checked = true;
                currentFilters.inStock = true;
                currentFilters.outOfStock = true;
                showNotification("Showing both in-stock and out-of-stock products", "info");
            }
            
            renderProducts(filterProducts(products));
            updateViewAllCategoriesButtonState();
        });
        
        outOfStockCheckbox.addEventListener('change', function() {
            console.log('Out-of-stock checkbox changed:', this.checked);
            
            // Update filter
            currentFilters.outOfStock = this.checked;
            
            // If both stock filters are unchecked, check both (show all)
            if (!inStockCheckbox.checked && !outOfStockCheckbox.checked) {
                inStockCheckbox.checked = true;
                outOfStockCheckbox.checked = true;
                currentFilters.inStock = true;
                currentFilters.outOfStock = true;
                showNotification("Showing both in-stock and out-of-stock products", "info");
            }
            
            renderProducts(filterProducts(products));
            updateViewAllCategoriesButtonState();
        });

        // Category filters
        categoryFilters.forEach(filter => {
            filter.addEventListener('change', function() {
                console.log('Category filter clicked:', this.value, 'Checked:', this.checked);
                
                // If "all" is clicked and checked, uncheck all other categories
                if (this.value === 'all' && this.checked) {
                    categoryFilters.forEach(categoryFilter => {
                        if (categoryFilter.value !== 'all') {
                            categoryFilter.checked = false;
                        }
                    });
                    currentFilters.categories = ['all'];
                }
                // If another category is clicked and "all" was checked, uncheck "all"
                else if (this.value !== 'all' && this.checked) {
                    const allFilter = document.querySelector('#category-filters input[value="all"]');
                    if (allFilter.checked) {
                        allFilter.checked = false;
                    }
                    
                    // Get all currently checked categories
                    const checkedCategories = [];
                    categoryFilters.forEach(categoryFilter => {
                        if (categoryFilter.checked) {
                            checkedCategories.push(categoryFilter.value);
                        }
                    });
                    
                    currentFilters.categories = checkedCategories;
                }
                // If a category was unchecked, check if we need to default back to "all"
                else {
                    updateCategoryFilters();
                }
                
                // Update URL with category parameter
                updateUrlParams();
                
                // Render filtered products
                renderProducts(filterProducts(products));
                
                // Update View All Categories button state
                updateViewAllCategoriesButtonState();
                
                // Log current filters for debugging
                console.log('Current filters after category change:', currentFilters);
            });
        });
        
        // Rating filters
        ratingFilters.forEach(filter => {
            filter.addEventListener('change', function() {
                console.log('Rating filter clicked:', this.id, 'Checked:', this.checked);
                
                // Update ratings filter
                updateRatingFilters();
                
                // Show notification
                if (currentFilters.ratings.length > 0) {
                    const minRating = Math.min(...currentFilters.ratings);
                    showNotification(`Showing products with ${minRating}+ stars rating`, 'info');
                }
                
                // Render filtered products
                renderProducts(filterProducts(products));
                updateViewAllCategoriesButtonState();
            });
        });
        
        // Tag filters
        tagFilters.forEach(button => {
            button.addEventListener('click', function() {
                const tag = this.getAttribute('data-tag');
                console.log('Tag filter clicked:', tag);
                
                // Toggle this tag in the filter
                if (currentFilters.tags.includes(tag)) {
                    // Remove tag
                    currentFilters.tags = currentFilters.tags.filter(t => t !== tag);
                    this.classList.remove('bg-green-500', 'text-white', 'border-green-500');
                    showNotification(`Removed "${tag}" filter`, 'info');
                } else {
                    // Add tag
                    currentFilters.tags.push(tag);
                    this.classList.add('bg-green-500', 'text-white', 'border-green-500');
                    showNotification(`Added "${tag}" filter`, 'success');
                }
                
                // Update URL with tag parameter
                updateUrlParams();
                
                // Render filtered products
                renderProducts(filterProducts(products));
                
                // Update button state
                updateViewAllCategoriesButtonState();
                
                // Log current filters for debugging
                console.log('Current filters after tag change:', currentFilters);
            });
        });
    }
    
    function updateUrlParams() {
        // Create a new URL object based on the current URL
        const url = new URL(window.location.href);
        
        // Update search parameter
        if (currentFilters.search) {
            url.searchParams.set('search', currentFilters.search);
        } else {
            url.searchParams.delete('search');
        }
        
        // Update category parameter
        if (currentFilters.categories.length === 1 && currentFilters.categories[0] !== 'all') {
            url.searchParams.set('category', currentFilters.categories[0]);
        } else {
            url.searchParams.delete('category');
        }
        
        // Update tag parameter
        if (currentFilters.tags.length === 1) {
            url.searchParams.set('tag', currentFilters.tags[0]);
        } else {
            url.searchParams.delete('tag');
        }
        
        // Replace the current URL with the updated one (without reloading the page)
        window.history.replaceState({}, '', url);
    }

    function updateCategoryFilters() {
        console.log('Updating category filters');
        
        // Get all checked categories
        const checkedCategories = [];
        categoryFilters.forEach(filter => {
            if (filter.checked) {
                checkedCategories.push(filter.value);
            }
        });
        
        console.log('Checked categories:', checkedCategories);
        
        // If "all" is checked, only use that
        if (checkedCategories.includes('all')) {
            categoryFilters.forEach(filter => {
                if (filter.value !== 'all') {
                    filter.checked = false;
                }
            });
            currentFilters.categories = ['all'];
        } else {
            // If no categories selected, default to "all"
            if (checkedCategories.length === 0) {
                const allFilter = document.querySelector('#category-filters input[value="all"]');
                if (allFilter) {
                    allFilter.checked = true;
                    showNotification('No category selected, showing all products', 'info');
                }
                currentFilters.categories = ['all'];
            } else {
                currentFilters.categories = checkedCategories;
            }
        }
        
        console.log('Updated filter categories:', currentFilters.categories);
    }
    
    function updateRatingFilters() {
        // Get all checked ratings
        const checkedRatings = [];
        ratingFilters.forEach(filter => {
            if (filter.checked) {
                // Extract the rating value from the ID (e.g., "rating-4" -> 4)
                const rating = parseInt(filter.id.split('-')[1]);
                checkedRatings.push(rating);
            }
        });
        
        currentFilters.ratings = checkedRatings;
    }

    function filterProducts(products) {
        console.log('Filtering products with current filters:', currentFilters);
        
        // Start with all products
        let filteredProducts = [...products];
        
        // Apply search filter
        if (currentFilters.search) {
            console.log('Applying search filter:', currentFilters.search);
            filteredProducts = filteredProducts.filter(product => 
                product.name.toLowerCase().includes(currentFilters.search)
            );
        }
        
        // Apply price filter
        console.log('Applying price filter: max price =', currentFilters.maxPrice);
        filteredProducts = filteredProducts.filter(product => 
            product.price <= currentFilters.maxPrice
        );
        
        // Apply category filter - when "all" is selected, show all categories
        if (!currentFilters.categories.includes('all')) {
            console.log('Applying category filter:', currentFilters.categories);
            filteredProducts = filteredProducts.filter(product => 
                currentFilters.categories.some(category => 
                    product.category.toLowerCase() === category.toLowerCase()
                )
            );
        } else {
            console.log('Showing all categories');
        }
        
        // Apply stock filter - include both in-stock and out-of-stock when both are checked
        console.log('Applying stock filter: inStock =', currentFilters.inStock, 'outOfStock =', currentFilters.outOfStock);
        if (!(currentFilters.inStock && currentFilters.outOfStock)) {
            filteredProducts = filteredProducts.filter(product => 
                (product.inStock && currentFilters.inStock) || 
                (!product.inStock && currentFilters.outOfStock)
            );
        }
        
        // Apply rating filter
        if (currentFilters.ratings.length > 0) {
            console.log('Applying rating filter:', currentFilters.ratings);
            filteredProducts = filteredProducts.filter(product => {
                // For each rating filter, check if product rating matches or exceeds
                return currentFilters.ratings.some(rating => product.rating >= rating);
            });
        }
        
        // Apply tag filter
        if (currentFilters.tags.length > 0) {
            console.log('Applying tag filter:', currentFilters.tags);
            filteredProducts = filteredProducts.filter(product => 
                product.tag && currentFilters.tags.includes(product.tag.toLowerCase())
            );
        }
        
        // Apply sorting
        if (currentFilters.sortBy !== 'featured') {
            console.log('Applying sort:', currentFilters.sortBy);
        }
        
        switch(currentFilters.sortBy) {
            case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default: // featured - use default ordering
                break;
        }
        
        console.log('Filtered products count:', filteredProducts.length);
        return filteredProducts;
    }

    function renderProducts(products) {
        // Update product count
        productCountElement.textContent = products.length;
        
        // Clear products container
        productsContainer.innerHTML = '';
        
        // If no products found
        if (products.length === 0) {
            productsContainer.innerHTML = `
                <div class="col-span-full text-center py-10">
                    <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 class="mt-4 text-lg font-medium text-gray-900">No products found</h3>
                    <p class="mt-1 text-gray-500">Try changing your search or filter criteria.</p>
                </div>
            `;
            return;
        }
        
        // Render each product
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'border border-gray-200 rounded-lg overflow-hidden bg-white product-card';
            
            let statusBadge = '';
            if (!product.inStock) {
                statusBadge = `<span class="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Sold out</span>`;
            } else if (product.discount) {
                statusBadge = `<span class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">-${product.discount}%</span>`;
            }
            
            let tagBadge = '';
            if (product.tag) {
                tagBadge = `<span class="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">${product.tag}</span>`;
            }
            
            let priceDisplay = '';
            if (product.discount) {
                priceDisplay = `${product.price}৳ <span class="line-through text-gray-400 text-sm ml-2">${product.originalPrice}৳</span>`;
            } else {
                priceDisplay = `${product.price}৳`;
            }
            
            let ratingDisplay = '';
            if (product.rating) {
                ratingDisplay = '<div class="flex mt-1 mb-2">';
                for (let i = 1; i <= 5; i++) {
                    if (i <= product.rating) {
                        ratingDisplay += `<i class="fas fa-star text-yellow-400 text-sm"></i>`;
                    } else {
                        ratingDisplay += `<i class="far fa-star text-yellow-400 text-sm"></i>`;
                    }
                }
                ratingDisplay += '</div>';
            }
            
            let buttonDisplay = '';
            if (product.inStock) {
                if (product.name.includes('প্রতি কেজি') || product.name.includes('হাফ কেজি')) {
                    buttonDisplay = `<button class="bg-white border border-green-500 text-green-500 px-4 py-2 rounded hover:bg-green-500 hover:text-white transition">Read more</button>`;
                } else {
                    buttonDisplay = `<button class="bg-white border border-green-500 text-green-500 px-4 py-2 rounded hover:bg-green-500 hover:text-white transition">Add to Cart</button>`;
                }
            } else {
                buttonDisplay = `<button class="bg-gray-200 text-gray-500 px-4 py-2 rounded cursor-not-allowed">Sold Out</button>`;
            }
            
            productCard.innerHTML = `
                <div class="relative">
                    ${statusBadge}
                    ${tagBadge}
                    <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover">
                    <div class="absolute top-2 right-2 flex space-x-1">
                        <button class="bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm quick-view" title="Quick view" data-id="${product.id}">
                            <i class="fas fa-eye text-gray-500 text-xs"></i>
                        </button>
                        <button class="bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm add-to-wishlist" title="Add to wishlist" data-id="${product.id}">
                            <i class="far fa-heart text-gray-500 text-xs"></i>
                        </button>
                    </div>
                </div>
                <div class="p-4">
                    <div class="flex justify-between items-start">
                        <h3 class="font-medium">${product.name}</h3>
                        <span class="text-xs bg-gray-100 px-2 py-1 rounded">${product.category}</span>
                    </div>
                    ${ratingDisplay}
                    <p class="text-green-600 font-bold mt-2">${priceDisplay}</p>
                    <div class="mt-4 grid grid-cols-1 gap-2">
                        ${buttonDisplay}
                        <button class="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-100 transition">Add to wishlist</button>
                    </div>
                </div>
            `;
            
            productsContainer.appendChild(productCard);
        });
        
        // Add event listeners to new buttons
        setupProductInteractions();
    }

    // Function to update cart count in the header
    function updateCartCount() {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            const cart = JSON.parse(localStorage.getItem('saporaBDCart')) || [];
            const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
            cartCountElement.textContent = itemCount;
            
            // Add animation to cart count
            cartCountElement.classList.add('pulse-animation');
            setTimeout(() => {
                cartCountElement.classList.remove('pulse-animation');
            }, 700);
        }
    }
    
    function setupProductInteractions() {
        console.log('Setting up product interactions for', productsContainer.querySelectorAll('button').length, 'buttons');
        
        // Remove previous event listeners to avoid duplicates
        document.querySelectorAll('.product-card button').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });
        
        // Add event listeners to "Add to Cart" buttons only
        const addToCartButtons = document.querySelectorAll('.product-card button');
        
        addToCartButtons.forEach(button => {
            if (button.textContent.trim() === 'Add to Cart') {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Add to Cart button clicked!');
                    
                    // Find the parent product card
                    const productCard = this.closest('.product-card');
                    if (!productCard) {
                        console.error('Cannot find product card');
                        return;
                    }
                    
                    // Find product data
                    let productId = null;
                    
                    // Try to get product ID from the quick-view button
                    const quickViewButton = productCard.querySelector('.quick-view');
                    if (quickViewButton) {
                        productId = parseInt(quickViewButton.getAttribute('data-id'));
                    }
                    
                    // If we can't find the ID from the quick-view button, try to extract it from product name
                    if (!productId) {
                        const productName = productCard.querySelector('h3').textContent;
                        // Find product by name
                        const product = products.find(p => p.name === productName);
                        if (product) {
                            productId = product.id;
                        }
                    }
                    
                    if (!productId) {
                        console.error('Cannot find product ID');
                        showNotification('Error: Cannot identify product', 'error');
                        return;
                    }
                    
                    const product = products.find(p => p.id === productId);
                    if (!product) {
                        console.error('Cannot find product with ID:', productId);
                        showNotification('Error: Product not found', 'error');
                        return;
                    }
                    
                    // Add to cart
                    console.log('Adding product to cart:', product);
                    const success = addProductToCart(product);
                    
                    if (success) {
                        // Show visual feedback on the button
                        showButtonFeedback(this, 'Added to cart');
                    }
                });
            }
        });
    }
    
    // Separate function to add product to cart
    function addProductToCart(product) {
        console.log('Adding to cart:', product);
        
        try {
            // Create cart item object
            const cartItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1,
                originalPrice: product.originalPrice
            };
            
            // Get current cart from localStorage
            let cart = [];
            try {
                const cartData = localStorage.getItem('saporaBDCart');
                console.log('Cart data from localStorage:', cartData);
                cart = cartData ? JSON.parse(cartData) : [];
            } catch (e) {
                console.error('Error parsing cart data:', e);
                cart = [];
            }
            
            console.log('Current cart:', cart);
            
            // Check if product already exists in cart
            const existingItemIndex = cart.findIndex(item => item.id === product.id);
            
            if (existingItemIndex !== -1) {
                // Item exists, increment quantity
                cart[existingItemIndex].quantity += 1;
                showNotification(`${product.name} quantity updated in cart`, 'success');
            } else {
                // Item doesn't exist, add it
                cart.push(cartItem);
                showNotification(`${product.name} added to cart`, 'success');
            }
            
            // Save updated cart to localStorage
            localStorage.setItem('saporaBDCart', JSON.stringify(cart));
            
            // Update cart count
            updateCartCount();
            
            return true;
        } catch (error) {
            console.error('Error in addProductToCart:', error);
            showNotification('Failed to add product to cart', 'error');
            return false;
        }
    }
    
    // Function to show visual feedback on buttons
    function showButtonFeedback(button, text, color = '#10B981') {
        // Store original properties
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
    
    // Check if cat.js has defined createNotificationContainer and showNotification
    // If not, define them here
    function createNotificationContainer() {
        // Skip if already defined by cart.js
        if (window.notificationContainerCreated) return;
        
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'fixed bottom-4 right-4 z-50 flex flex-col space-y-2';
            document.body.appendChild(container);
            
            // Add necessary CSS for notifications and animations
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
            
            // Mark as created to avoid duplication
            window.notificationContainerCreated = true;
        }
    }
    
    // Function to show notifications
    function showNotification(message, type = 'success') {
        // Use the function from cart.js if available
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
            return;
        }
        
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
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Make showNotification globally available
    window.showNotification = showNotification;

    // Function to update the styling of the View All Categories button
    function updateViewAllCategoriesButtonState() {
        const viewAllCategoriesBtn = document.getElementById('view-all-categories');
        const headerViewAllLink = document.getElementById('header-view-all');
        const shopViewAllBtn = document.getElementById('shop-view-all');
        
        if (!viewAllCategoriesBtn) return;
        
        // Check if we're showing all products with default filters
        const isShowingAll = 
            (currentFilters.categories.length === 1 && currentFilters.categories.includes('all')) && 
            currentFilters.search === '' && 
            currentFilters.tags.length === 0 && 
            currentFilters.ratings.length === 0 && 
            currentFilters.maxPrice === 2000 &&
            currentFilters.inStock === true &&
            currentFilters.outOfStock === true;
            
        if (isShowingAll) {
            // Highlight the sidebar button
            viewAllCategoriesBtn.classList.add('bg-green-600');
            viewAllCategoriesBtn.classList.add('font-semibold');
            
            // Highlight the header link if it exists
            if (headerViewAllLink) {
                headerViewAllLink.classList.add('text-green-500');
                headerViewAllLink.classList.add('font-semibold');
            }
            
            // Highlight the shop section button if it exists
            if (shopViewAllBtn) {
                shopViewAllBtn.classList.add('text-green-600');
                shopViewAllBtn.classList.add('font-semibold');
            }
        } else {
            // Remove highlight from sidebar button
            viewAllCategoriesBtn.classList.remove('bg-green-600');
            viewAllCategoriesBtn.classList.remove('font-semibold');
            
            // Remove highlight from header link if it exists
            if (headerViewAllLink) {
                headerViewAllLink.classList.remove('text-green-500');
                headerViewAllLink.classList.remove('font-semibold');
            }
            
            // Remove highlight from shop section button if it exists
            if (shopViewAllBtn) {
                shopViewAllBtn.classList.remove('text-green-600');
                shopViewAllBtn.classList.remove('font-semibold');
            }
        }
        
        // Log the current filter state for debugging
        console.log('Current filters:', currentFilters);
    }

    // Add cart functionality to home page product cards as well
    function initHomePageCart() {
        const homePageProductCards = document.querySelectorAll('.product-card');
        
        homePageProductCards.forEach(card => {
            const addToCartBtn = card.querySelector('button');
            if (addToCartBtn && addToCartBtn.textContent.trim() === 'Add to Cart') {
                addToCartBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Extract product info from the card
                    const name = card.querySelector('h3').textContent;
                    const priceText = card.querySelector('.text-green-600').textContent;
                    const price = parseInt(priceText.replace(/[^0-9]/g, ''));
                    const image = card.querySelector('img').src;
                    
                    // Create product object
                    const product = {
                        id: Date.now(), // Generate unique ID based on timestamp
                        name: name,
                        price: price,
                        image: image,
                        inStock: true
                    };
                    
                    // Add to cart
                    addProductToCart(product);
                    
                    // Show feedback
                    showButtonFeedback(this, 'Added to cart');
                });
            }
        });
    }
    
    // Initialize cart for home page if we're on the home page
    if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
        initHomePageCart();
    }
    
    // Make sure to expose methods globally for other scripts to use
    window.updateCartCount = updateCartCount;
    window.addProductToCart = addProductToCart;
    window.showNotification = showNotification;
}); 