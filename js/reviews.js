// HMW Reviews System (Local Backend)
// Works with server.py to save reviews to assets/reviews.json

const reviewForm = document.getElementById('review-form');

// Initialize (Run automatically on index where this script is loaded)
document.addEventListener('DOMContentLoaded', () => {
    // Default behavior for Index Page
    if (document.getElementById('dynamic-reviews-grid') && !window.location.pathname.includes('html')) {
        fetchReviews('dynamic-reviews-grid');
    }
});

// Fetch Reviews from JSON File
// params:
// - containerId: The ID of the div to append reviews to
// - filterModel: (Optional) The specific car model to show reviews for
export async function fetchReviews(containerId, filterModel = null) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    try {
        // Add timestamp to prevent caching
        const response = await fetch(`assets/reviews.json?t=${Date.now()}`);
        if (!response.ok) throw new Error("File not found");

        const reviews = await response.json();

        grid.innerHTML = '';

        // Filter if model is provided
        const filteredReviews = filterModel
            ? reviews.filter(r => r.car === filterModel)
            : reviews;

        if (filteredReviews.length === 0) {
            grid.innerHTML = '<p class="text-center" style="width:100%; color:var(--color-text-muted);">No reviews for this model yet.</p>';
            return;
        }

        filteredReviews.forEach(review => {
            const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

            const card = document.createElement('div');
            card.className = 'review-card fade-up visible';
            card.innerHTML = `
                <div class="review-stars" style="color:var(--color-gold); letter-spacing:2px;">${stars}</div>
                <p class="review-text">"${review.text}"</p>
                <span class="reviewer">${review.name} • ${review.car} Owner</span>
            `;
            grid.appendChild(card);
        });
    } catch (e) {
        console.error("Could not load reviews:", e);
        grid.innerHTML = '<p class="text-center" style="color:gray;">Start the server (server.py) to see reviews.</p>';
    }
}

// Make it globally available for non-module scripts if needed (fallback)
window.fetchReviews = fetchReviews;

// Submit Function (POST to Server)
if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = reviewForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = "Saving...";
        btn.disabled = true;

        const name = document.getElementById('review-name').value;
        const car = document.getElementById('review-car').value;
        const rating = document.querySelector('input[name="rating"]:checked').value;
        const text = document.getElementById('review-text').value;

        const newReview = {
            name: name,
            car: car,
            rating: parseInt(rating),
            text: text,
            timestamp: Date.now()
        };

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newReview)
            });

            if (response.ok) {
                alert("Review published successfully!");
                reviewForm.reset();
                // Refresh list if we are on the page with the grid
                fetchReviews('dynamic-reviews-grid');
            } else {
                throw new Error("Server rejected the request");
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Failed to save review. Make sure you are running 'python server.py'");
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}
