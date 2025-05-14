// DOM Elements
const registrationForm = document.getElementById('registration-form');
const statusForm = document.getElementById('status-form');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');
const errorDetails = document.getElementById('error-details');
const tryAgainBtn = document.getElementById('try-again-btn');
const searchType = document.getElementById('searchType');
const mobileField = document.getElementById('mobileField');
const idField = document.getElementById('idField');
const statusErrorMessage = document.getElementById('status-error-message');
const statusTryAgainBtn = document.getElementById('status-try-again-btn');
const loader = document.getElementById('loader');
const customerStatus = document.getElementById('customer-status');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  initializeRegistrationForm();
  initializeStatusForm();
});

// Initialize the registration form
function initializeRegistrationForm() {
  if (!registrationForm) return;
  
  registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const address = document.getElementById('address').value.trim();
    const identificationNo = document.getElementById('identificationNo').value.trim();
    
    try {
      registrationForm.style.display = 'none';
      
      // Register customer
      await api.registerCustomer({
        firstName,
        lastName,
        email,
        mobile,
        address,
        identificationNo
      });
      
      // Show success message
      successMessage.style.display = 'block';
    } catch (error) {
      // Show error message
      errorMessage.style.display = 'block';
      errorDetails.textContent = error.message || 'Registration failed. Please try again.';
    }
  });
  
  // Try again button
  if (tryAgainBtn) {
    tryAgainBtn.addEventListener('click', () => {
      errorMessage.style.display = 'none';
      registrationForm.style.display = 'block';
    });
  }
}

// Initialize the status form
function initializeStatusForm() {
  if (!statusForm) return;
  
  // Handle search type change
  if (searchType) {
    searchType.addEventListener('change', () => {
      const selectedValue = searchType.value;
      
      if (selectedValue === 'mobile') {
        mobileField.style.display = 'block';
        idField.style.display = 'none';
      } else {
        mobileField.style.display = 'none';
        idField.style.display = 'block';
      }
    });
  }
  
  statusForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const selectedSearchType = searchType.value;
    let searchValue;
    
    if (selectedSearchType === 'mobile') {
      searchValue = document.getElementById('mobileNumber').value.trim();
    } else {
      searchValue = document.getElementById('idNumber').value.trim();
    }
    
    if (!searchValue) {
      alert('Please enter a search value');
      return;
    }
    
    try {
      // Hide form and show loader
      statusForm.style.display = 'none';
      loader.style.display = 'block';
      
      // Fetch customer data using the unified endpoint
      const customer = await api.getCustomerByIdentifier(searchValue);
      
      // Fetch tiers for progress calculation
      const tiers = await api.getLoyaltyTiers();
      
      // Display customer data
      displayCustomerStatus(customer, tiers);
      
      // Hide loader and show customer status
      loader.style.display = 'none';
      customerStatus.style.display = 'block';
    } catch (error) {
      // Hide loader and show error message
      loader.style.display = 'none';
      statusErrorMessage.style.display = 'block';
      
      // Update error message based on error type
      const errorMessageElement = statusErrorMessage.querySelector('p');
      errorMessageElement.textContent = error.message || 'We couldn\'t find a customer with the provided information.';
    }
  });
  
  // Try again button for status page
  if (statusTryAgainBtn) {
    statusTryAgainBtn.addEventListener('click', () => {
      statusErrorMessage.style.display = 'none';
      statusForm.style.display = 'block';
    });
  }
}

// Display customer status
function displayCustomerStatus(customer, tiers) {
  // Customer info
  document.getElementById('customer-name').textContent = `${customer.first_name} ${customer.last_name}`;
  document.getElementById('customer-email').textContent = customer.email;
  document.getElementById('customer-mobile').textContent = customer.mobile;
  document.getElementById('customer-join-date').textContent = formatDate(customer.join_date);
  
  // Loyalty status
  const customerTier = document.getElementById('customer-tier');
  customerTier.textContent = customer.tier;
  
  // Add tier-specific class
  customerTier.className = 'tier-value';
  if (customer.tier === 'Purple') customerTier.classList.add('purple');
  if (customer.tier === 'Gold') customerTier.classList.add('gold');
  if (customer.tier === 'Platinum') customerTier.classList.add('platinum');
  
  // Points
  document.getElementById('customer-points').textContent = customer.available_points;
  document.getElementById('earned-points').textContent = customer.earned_points;
  document.getElementById('redeemed-points').textContent = customer.redeemed_points;
  
  // Tier progress
  calculateTierProgress(customer, tiers);
  
  // Next tier benefits
  displayNextTierBenefits(customer, tiers);
}

// Calculate and display tier progress
function calculateTierProgress(customer, tiers) {
  // Sort tiers by threshold
  const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
  
  // Get current tier
  const currentTierIndex = sortedTiers.findIndex(tier => tier.tier_name === customer.tier);
  
  // Check if this is the highest tier
  if (currentTierIndex === sortedTiers.length - 1) {
    // Already at the highest tier
    document.getElementById('tier-percentage').textContent = '100%';
    document.getElementById('tier-progress-fill').style.width = '100%';
    return;
  }
  
  // Calculate progress to next tier
  const currentTier = sortedTiers[currentTierIndex];
  const nextTier = sortedTiers[currentTierIndex + 1];
  
  const pointsForNextTier = nextTier.threshold;
  const currentPoints = customer.available_points;
  const startPoints = currentTier.threshold;
  
  const pointsNeeded = pointsForNextTier - startPoints;
  const pointsEarned = currentPoints - startPoints;
  const progressPercentage = Math.min(100, Math.round((pointsEarned / pointsNeeded) * 100));
  
  document.getElementById('tier-percentage').textContent = `${progressPercentage}%`;
  document.getElementById('tier-progress-fill').style.width = `${progressPercentage}%`;
}

// Display next tier benefits
function displayNextTierBenefits(customer, tiers) {
  // Sort tiers by threshold
  const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
  
  // Get current tier
  const currentTierIndex = sortedTiers.findIndex(tier => tier.tier_name === customer.tier);
  
  // Container for tier benefits
  const nextTierContainer = document.getElementById('next-tier-container');
  nextTierContainer.innerHTML = '';
  
  // Check if this is the highest tier
  if (currentTierIndex === sortedTiers.length - 1) {
    const tierBenefit = document.createElement('div');
    tierBenefit.className = 'tier-benefit';
    tierBenefit.innerHTML = '<p>Congratulations! You\'ve reached the highest tier level!</p>';
    nextTierContainer.appendChild(tierBenefit);
    return;
  }
  
  // Get next tier
  const nextTier = sortedTiers[currentTierIndex + 1];
  
  // Create benefit element
  const tierBenefit = document.createElement('div');
  tierBenefit.className = 'tier-benefit';
  
  // Calculate points needed for next tier
  const pointsNeeded = nextTier.threshold - customer.available_points;
  
  let benefitHTML = `
    <h4>${nextTier.tier_name} Tier Benefits</h4>
    <p>Earn ${pointsNeeded} more points to reach the ${nextTier.tier_name} tier!</p>
    <p>Benefits include:</p>
    <ul>
      <li>${nextTier.discount}% discount on all purchases</li>
  `;
  
  // Add different benefits based on tier
  if (nextTier.tier_name === 'Gold') {
    benefitHTML += `
      <li>Priority customer service</li>
      <li>Exclusive access to Gold member events</li>
    `;
  } else if (nextTier.tier_name === 'Platinum') {
    benefitHTML += `
      <li>Free delivery on all orders</li>
      <li>VIP customer service</li>
      <li>Early access to new products</li>
      <li>Exclusive Platinum member events</li>
    `;
  }
  
  benefitHTML += '</ul>';
  tierBenefit.innerHTML = benefitHTML;
  nextTierContainer.appendChild(tierBenefit);
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}