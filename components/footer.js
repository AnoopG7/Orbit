// Footer functionality
(function() {
    'use strict';
    
    // Newsletter subscription
    const newsletterSubscribe = document.getElementById('newsletter-subscribe');
    const newsletterEmail = document.getElementById('newsletter-email');
    
    if (newsletterSubscribe && newsletterEmail) {
        newsletterSubscribe.addEventListener('click', (e) => {
            e.preventDefault();
            const email = newsletterEmail.value.trim();
            
            if (!email) {
                alert('Please enter your email address.');
                return;
            }
            
            if (!isValidEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Here you would typically send the email to your backend
            console.log('Newsletter subscription:', email);
            alert('Thank you for subscribing! 🎉');
            newsletterEmail.value = '';
        });
        
        // Allow subscription with Enter key
        newsletterEmail.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                newsletterSubscribe.click();
            }
        });
    }
    
    // Back to top functionality
    const backToTop = document.getElementById('back-to-top');
    
    if (backToTop) {
        // Show/hide based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTop.classList.remove('opacity-0', 'invisible');
                backToTop.classList.add('opacity-100', 'visible');
            } else {
                backToTop.classList.add('opacity-0', 'invisible');
                backToTop.classList.remove('opacity-100', 'visible');
            }
        });
        
        // Smooth scroll to top
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Add smooth scrolling to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
})();
