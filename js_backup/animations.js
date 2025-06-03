// animations.js - Adds dynamic effects to the website

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    initScrollAnimations();
    initHoverEffects();
    
    // Add scroll event listener for scroll-triggered animations
    window.addEventListener('scroll', function() {
        revealOnScroll();
    });
});

// Initialize scroll-triggered animations
function initScrollAnimations() {
    // Add fade-in class to elements that should animate on scroll
    const animatedElements = document.querySelectorAll('section');
    animatedElements.forEach(element => {
        element.classList.add('scroll-fade');
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out';
        element.style.transform = 'translateY(20px)';
    });
    
    // Trigger initial check for elements in viewport
    revealOnScroll();
}

// Reveal elements when they enter the viewport
function revealOnScroll() {
    const animatedElements = document.querySelectorAll('.scroll-fade');
    const windowHeight = window.innerHeight;
    
    animatedElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150; // How many pixels from the top before the element becomes visible
        
        if (elementTop < windowHeight - elementVisible) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Initialize hover effects for interactive elements
function initHoverEffects() {
    // Add hover effects to navigation links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
            this.style.transform = 'translateY(-2px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('button, .bg-blue-900, .bg-white.border');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
            this.style.transform = 'scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Function to animate page transitions
function animatePageTransition(url) {
    const content = document.querySelector('body');
    content.style.opacity = '0';
    content.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}
