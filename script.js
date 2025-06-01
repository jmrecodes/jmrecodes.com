// JavaScript for portfolio interactivity will go here. 

document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.getElementById('burger-menu');
    const mainNav = document.getElementById('main-nav');
    const mainHeader = document.getElementById('main-header');
    const logoSquare = document.getElementById('logo-square');
    const logoBanner = document.getElementById('logo-banner');
    const navLinks = document.querySelectorAll('nav#main-nav a');
    const sections = document.querySelectorAll('main section[id]');

    // Function to determine if the current page is index.html
    function isHomePage() {
        return window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    }

    // Initial state for logos if needed (CSS handles active by default)
    // logoSquare.classList.add('active'); 

    function adjustBodyPadding() {
        if (mainHeader) {
            const headerHeight = mainHeader.offsetHeight;
            document.body.style.paddingTop = headerHeight + 'px';
        }
    }

    // Adjust padding on load and on resize (in case header height changes with viewport)
    adjustBodyPadding();
    window.addEventListener('resize', adjustBodyPadding);

    // Hamburger menu toggle
    if (burgerMenu && mainNav) {
        burgerMenu.addEventListener('click', function() {
            mainNav.classList.toggle('open');
            burgerMenu.classList.toggle('open');
            const isExpanded = mainNav.classList.contains('open');
            burgerMenu.setAttribute('aria-expanded', isExpanded);
        });
    }

    // Sticky header and logo change on scroll
    let headerInitialHeight = 0;
    if (mainHeader) {
      headerInitialHeight = mainHeader.offsetHeight;
      // Update body padding top dynamically if not already set or needs adjustment
      // document.body.style.paddingTop = headerInitialHeight + 'px';
    }

    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;

        if (mainHeader) {
            if (scrollPosition > 50) { // Adjust scroll threshold as needed
                mainHeader.classList.add('scrolled');
                logoSquare.classList.remove('active');
                logoBanner.classList.add('active');
                // Optional: adjust body padding if header height changes significantly
                // if (mainHeader.offsetHeight < headerInitialHeight) {
                //    document.body.classList.add('scrolled-padding'); 
                // }
            } else {
                mainHeader.classList.remove('scrolled');
                logoSquare.classList.add('active');
                logoBanner.classList.remove('active');
                // document.body.classList.remove('scrolled-padding');
            }
        }
        
        // Active link highlighting on scroll - ONLY ON HOME PAGE
        if (isHomePage() && sections.length > 0) {
            let currentSectionId = '';
            const headerHeight = mainHeader ? mainHeader.offsetHeight : 0;
            // Determine current section based on scroll position
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                const sectionTop = section.offsetTop - headerHeight - 20;
                if (scrollPosition >= sectionTop) {
                    currentSectionId = section.getAttribute('id');
                    break; // Found the current section
                }
            }
            // If no section is strictly met (e.g., at the very top, or between sections), default to home if scrollPosition is near top
            if (!currentSectionId && scrollPosition < headerHeight) { // Or some small threshold
                currentSectionId = 'home';
            }

            updateActiveLink(currentSectionId);

        } else if (window.location.pathname.endsWith('blog.html')) {
            // On blog.html, ensure only the 'blog.html' link is active if it exists
            // This is mostly handled by the class in blog.html but good for consistency
            navLinks.forEach(link => {
                if (link.getAttribute('href') === 'blog.html') {
                    link.classList.add('active-link');
                } else {
                    link.classList.remove('active-link');
                }
            });
        } else {
            // For other pages like blog.html, ensure no scroll-based highlighting interferes
            // The active link is set in the HTML for blog.html
            // Or, if multiple pages, could check current URL against nav link hrefs
            navLinks.forEach(link => {
                if (window.location.href === link.href) {
                    link.classList.add('active-link');
                } else {
                    link.classList.remove('active-link');
                }
            });
        }
    });

    // Function to update active navigation link
    function updateActiveLink(activeId) {
        navLinks.forEach(link => {
            link.classList.remove('active-link');
            const linkHref = link.getAttribute('href');
            if (linkHref === '#' + activeId || linkHref === 'index.html#' + activeId) {
                link.classList.add('active-link');
            }
        });
    }

    // Smooth scrolling & page load handling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const currentPath = window.location.pathname.split('/').pop(); // Gets current page filename e.g., 'index.html' or 'blog.html'

            if (href.startsWith('#')) { // Purely on-page link
                e.preventDefault();
                smoothScrollToTarget(href);
            } else if (href.includes('index.html#')) {
                const targetPage = href.substring(0, href.indexOf('#'));
                const targetId = href.substring(href.indexOf('#'));

                if (currentPath === targetPage || (currentPath === '' && targetPage === 'index.html')) { // Already on index.html
                    e.preventDefault();
                    smoothScrollToTarget(targetId);
                } else {
                    // Allow default navigation to index.html, hash will be handled on load
                    // No e.preventDefault() here
                }
            } else {
                // Allow default navigation for other links (e.g., to blog.html from index.html)
                // No e.preventDefault() here
            }

            // Close mobile nav if open after clicking a link (if it was a click that didn't reload the page)
            if (e.defaultPrevented && mainNav && mainNav.classList.contains('open')) {
                closeMobileNav();
            }
        });
    });

    // Function to handle smooth scroll to target ID
    function smoothScrollToTarget(targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            let targetPosition = targetElement.offsetTop;
            if (mainHeader) {
                targetPosition -= mainHeader.offsetHeight;
            }
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    // Function to close mobile nav
    function closeMobileNav() {
        if (mainNav && burgerMenu) {
            mainNav.classList.remove('open');
            burgerMenu.classList.remove('open');
            burgerMenu.setAttribute('aria-expanded', 'false');
        }
    }

    // Handle hash scrolling on page load (e.g., when navigating to index.html#contact from blog.html)
    if (isHomePage() && window.location.hash) {
        // Use a timeout to ensure page layout is complete, especially header height
        setTimeout(() => {
            const hash = window.location.hash;
            smoothScrollToTarget(hash);
            updateActiveLink(hash.substring(1)); // Update active link after scrolling
        }, 100); // Small delay, adjust if needed
    } else if (isHomePage()) {
        // If on home page without a hash (e.g. fresh load of index.html), set #home as active
        // and ensure scroll listener picks it up correctly if at top.
        setTimeout(() => { // Delay to ensure scroll listener has run once or page is settled
             if (window.scrollY < 50) { // Check if near the top
                updateActiveLink('home');
             }
        },150); 
    }
});

// Google Maps Initialization
async function initMap() {
    const location = { lat: 9.3077, lng: 123.3054 }; // Coordinates for Negros Oriental (approximate center)
    const mapElement = document.getElementById('map');

    if (!mapElement) {
        console.error("Map element not found");
        return;
    }

    // Request the AdvancedMarkerElement library
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    const map = new Map(mapElement, {
        zoom: 9, // Adjust zoom level as needed
        center: location,
        mapId: 'adaf57edf66d1a3ea64e717d' // REQUIRED for Advanced Markers. You might need to create a Map ID in Google Cloud Console.
    });

    new AdvancedMarkerElement({
        map: map,
        position: location,
        title: 'Negros Oriental, Philippines'
    });
}

// Expose initMap to global scope if it isn't already (for Google API callback)
window.initMap = initMap; 