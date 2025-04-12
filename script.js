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