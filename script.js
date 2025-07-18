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
    
    // Try to resend any failed submissions
    retryFailedSubmissions();
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
    // Store data in localStorage as a backup
    const submissions = JSON.parse(localStorage.getItem('bondfyrSubmissions') || '[]');
    const submission = { 
        name, 
        email, 
        suggestion, 
        timestamp: new Date().toISOString() 
    };
    submissions.push(submission);
    localStorage.setItem('bondfyrSubmissions', JSON.stringify(submissions));
    
    // Send data to database via API
    sendToDatabase(submission);
    
    // Log for debug purposes
    console.log("Form submitted:", submission);
}

// Show success message
function showSuccessMessage(form, successMessage) {
    form.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Keep the success message displayed
    // It won't automatically revert to the form
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

// Send data to backend database
function sendToDatabase(formData) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    return fetch('https://x8ki-letl-twmt.n7.xano.io/api:qy9dSsak/waitlist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
        signal: controller.signal
    })
    .then(response => {
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Server error: ${response.status} - ${text || 'No error message'}`);
            });
        }
        return response.json();
    })
    .then(data => {
        // Show success message
        displaySuccessMessage(formData.email);
        return data;
    })
    .catch(error => {
        console.error('Submission failed:', error.message);
        
        // Store the failed submission
        storeFailedSubmission(formData);
        
        // Display error to user
        const formElement = document.getElementById('waitlist-form');
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Unable to submit form due to a network error. We\'ll automatically retry when your connection improves.';
        formElement.appendChild(errorMessage);
        
        setTimeout(() => {
            errorMessage.remove();
        }, 5000);
        
        throw error;
    });
}

function displaySuccessMessage(email) {
    // Hide the form
    const formElement = document.getElementById('waitlist-form');
    formElement.style.display = 'none';
    
    // Create success message container
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    
    // Add icon (using entity for simplicity, but you could use Font Awesome or similar)
    const icon = document.createElement('i');
    icon.innerHTML = '&#10004;'; // Checkmark
    successMessage.appendChild(icon);
    
    // Add heading
    const heading = document.createElement('h3');
    heading.textContent = 'You\'re on the waitlist!';
    successMessage.appendChild(heading);
    
    // Add message
    const message = document.createElement('p');
    message.textContent = `Thanks for joining! We've added ${email} to our waitlist.`;
    successMessage.appendChild(message);
    
    const subMessage = document.createElement('p');
    subMessage.textContent = 'We\'ll notify you as soon as Bondfyr is ready.';
    successMessage.appendChild(subMessage);
    
    // Insert success message
    formElement.parentNode.insertBefore(successMessage, formElement);
    
    // Show success message with animation
    setTimeout(() => {
        successMessage.style.display = 'block';
    }, 100);
}

// Store failed submissions for later retry
function storeFailedSubmission(data) {
    const failedSubmissions = JSON.parse(localStorage.getItem('bondfyrFailedSubmissions') || '[]');
    failedSubmissions.push({
        data: data,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('bondfyrFailedSubmissions', JSON.stringify(failedSubmissions));
    
    // Set up retry on next page load
    localStorage.setItem('bondfyrShouldRetry', 'true');
}

// Retry sending failed submissions
function retryFailedSubmissions() {
    const shouldRetry = localStorage.getItem('bondfyrShouldRetry');
    if (shouldRetry !== 'true') return;
    
    const failedSubmissions = JSON.parse(localStorage.getItem('bondfyrFailedSubmissions') || '[]');
    if (failedSubmissions.length === 0) {
        localStorage.removeItem('bondfyrShouldRetry');
        return;
    }
    
    console.log(`Attempting to resend ${failedSubmissions.length} failed submissions`);
    
    // Try to send each failed submission again
    const remainingSubmissions = failedSubmissions.filter(item => {
        // Only retry submissions less than 7 days old
        const submissionDate = new Date(item.timestamp);
        const now = new Date();
        const daysDifference = (now - submissionDate) / (1000 * 60 * 60 * 24);
        
        if (daysDifference > 7) return false;
        
        // Try to send it again
        try {
            fetch('https://api.bondfyr.com/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(item.data)
            });
            return false; // Remove from the retry list
        } catch (error) {
            return true; // Keep in the retry list
        }
    });
    
    // Update localStorage with remaining failed submissions
    localStorage.setItem('bondfyrFailedSubmissions', JSON.stringify(remainingSubmissions));
    if (remainingSubmissions.length === 0) {
        localStorage.removeItem('bondfyrShouldRetry');
    }
}

// Function to send data to Firebase (placeholder for future implementation)
function sendToFirebase(name, email, suggestion) {
    // This function can be implemented later when Firebase is set up
    // Firebase functionality will go here
} 

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuIcon && navLinks) {
        mobileMenuIcon.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinksItems = document.querySelectorAll('.nav-links a');
    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
});

// Smooth Scrolling for Navigation Links
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

// How It Works Tab Functionality
function initializeHowItWorksTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Legal Pages Tab Functionality
function initializeLegalTabs() {
    const legalTabButtons = document.querySelectorAll('.legal-tab-button');
    const legalTabContents = document.querySelectorAll('.legal-tab-content');

    legalTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            legalTabButtons.forEach(btn => btn.classList.remove('active'));
            legalTabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Initialize all tabs when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeHowItWorksTabs();
    initializeLegalTabs();
});

// Header Background on Scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(10, 10, 10, 0.98)';
    } else {
        header.style.background = 'rgba(10, 10, 10, 0.95)';
    }
});

// Intersection Observer for Animation on Scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll(
        '.feature-card, .safety-card, .step-card, .business-card, .app-feature, .category-card, .contact-card, .flow-step'
    );
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
});

// Trust Indicators Animation
function animateTrustIndicators() {
    const trustItems = document.querySelectorAll('.trust-item');
    trustItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Hero Animation on Load
window.addEventListener('load', function() {
    const heroText = document.querySelector('.hero-text');
    const heroImage = document.querySelector('.hero-image');
    
    if (heroText) {
        heroText.style.opacity = '1';
        heroText.style.transform = 'translateY(0)';
    }
    
    if (heroImage) {
        heroImage.style.opacity = '1';
        heroImage.style.transform = 'translateX(0)';
    }
    
    // Animate trust indicators after hero loads
    setTimeout(animateTrustIndicators, 800);
});

// Payment Flow Steps Animation
function animatePaymentFlow() {
    const flowSteps = document.querySelectorAll('.flow-step');
    flowSteps.forEach((step, index) => {
        setTimeout(() => {
            step.style.opacity = '1';
            step.style.transform = 'translateY(0) scale(1)';
        }, index * 300);
    });
}

// Trigger payment flow animation when section comes into view
const paymentSection = document.querySelector('.payment-security');
if (paymentSection) {
    const paymentObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animatePaymentFlow();
                paymentObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    paymentObserver.observe(paymentSection);
}

// Mobile Menu Styles
const style = document.createElement('style');
style.textContent = `
    @media (max-width: 768px) {
        .nav-links {
            position: fixed;
            top: 70px;
            right: -100%;
            width: 100%;
            height: calc(100vh - 70px);
            background: rgba(10, 10, 10, 0.98);
            backdrop-filter: blur(10px);
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding-top: 50px;
            transition: right 0.3s ease;
            z-index: 999;
        }
        
        .nav-links.active {
            right: 0;
        }
        
        .nav-links a {
            margin: 20px 0;
            font-size: 1.2rem;
        }
        
        .cta-button {
            margin-top: 30px;
        }
    }
`;
document.head.appendChild(style);

// Particle Effect for Hero Section (Optional Enhancement)
function createParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: #FF1A47;
            border-radius: 50%;
            pointer-events: none;
            opacity: 0.5;
            animation: float 6s infinite linear;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 6}s;
        `;
        hero.appendChild(particle);
    }
}

// Add particle animation keyframes
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    @keyframes float {
        0% {
            transform: translateY(100px) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 0.5;
        }
        90% {
            opacity: 0.5;
        }
        100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(particleStyle);

// Initialize particles on load
window.addEventListener('load', createParticles);

// Form Validation and Enhancement (if forms are added later)
function enhanceForm(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
}

// Download Button Click Tracking (Analytics placeholder)
document.addEventListener('DOMContentLoaded', function() {
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add analytics tracking here if needed
            console.log('Download button clicked:', this.textContent);
        });
    });
});

// Email Link Click Tracking
document.addEventListener('DOMContentLoaded', function() {
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.addEventListener('click', function() {
            console.log('Email link clicked:', this.href);
        });
    });
});

// Performance Optimization: Lazy Loading for Heavy Elements
function lazyLoadElements() {
    const lazyElements = document.querySelectorAll('.lazy-load');
    const lazyObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
                lazyObserver.unobserve(entry.target);
            }
        });
    });
    
    lazyElements.forEach(element => {
        lazyObserver.observe(element);
    });
}

document.addEventListener('DOMContentLoaded', lazyLoadElements); 