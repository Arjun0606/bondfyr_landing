// Form submission handling
document.addEventListener('DOMContentLoaded', function() {
    const suggestionForm = document.getElementById('suggestionForm');
    const successMessage = document.getElementById('success-message');
    
    if (suggestionForm) {
        suggestionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const suggestion = document.getElementById('suggestion').value;
            
            // Validate the form data
            if (!validateForm(name, email)) {
                return;
            }
            
            // Store the data
            storeFormData(name, email, suggestion);
            
            // Show success message
            showSuccessMessage(suggestionForm, successMessage);
            
            // Reset form
            suggestionForm.reset();
        });
    }
    
    // Smooth scrolling for anchor links
    setupSmoothScrolling();
    
    // Sticky header
    setupStickyHeader();
    
    // Mobile menu toggle
    setupMobileMenu();
    
    // Scroll animations
    setupScrollAnimations();
});

// Form validation
function validateForm(name, email) {
    if (!name || !email) {
        alert("Please fill in all required fields.");
        return false;
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return false;
    }
    
    return true;
}

// Store form data
function storeFormData(name, email, suggestion) {
    // Store data in localStorage for future use or until a backend is implemented
    const submissions = JSON.parse(localStorage.getItem('bondfyrSubmissions') || '[]');
    submissions.push({ 
        name, 
        email, 
        suggestion, 
        timestamp: new Date().toISOString() 
    });
    localStorage.setItem('bondfyrSubmissions', JSON.stringify(submissions));
    
    // Log for debug purposes
    console.log("Form submitted:", { name, email, suggestion });
    
    // In the future, this function can be updated to send data to Firebase
    // sendToFirebase(name, email, suggestion);
}

// Show success message
function showSuccessMessage(form, successMessage) {
    form.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Hide success message after 5 seconds and show form again
    setTimeout(() => {
        successMessage.style.display = 'none';
        form.style.display = 'block';
    }, 5000);
}

// Setup smooth scrolling for anchor links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Setup sticky header
function setupStickyHeader() {
    const header = document.querySelector('header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            header.classList.toggle('sticky', window.scrollY > 0);
        });
    }
}

// Setup mobile menu
function setupMobileMenu() {
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuIcon && navLinks) {
        mobileMenuIcon.addEventListener('click', function() {
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.right = '0';
                navLinks.style.backgroundColor = 'var(--secondary-color)';
                navLinks.style.padding = '20px';
            }
        });
    }
}

// Setup scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all feature cards, service cards, and guideline cards
    document.querySelectorAll('.feature-card, .service-card, .guideline-card, .section-title, .section-subtitle').forEach(element => {
        observer.observe(element);
    });
}

// Function to send data to Firebase (placeholder for future implementation)
function sendToFirebase(name, email, suggestion) {
    // This function can be implemented later when Firebase is set up
    // Firebase functionality will go here
} 