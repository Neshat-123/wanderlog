const STORAGE_KEY = "wanderlogTrips";

let trips = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const tripForm = document.getElementById("trip-form");
const tripList = document.getElementById("trip-list");
const emptyState = document.getElementById("empty-state");
const tripModal = document.getElementById("trip-modal");
const openTripForm = document.getElementById("open-trip-form");
const closeTripForm = document.getElementById("close-trip-form");
const tripPhoto = document.getElementById("trip-photo");
const photoPreview = document.getElementById("photo-preview");

let editingTripId = null;

tripPhoto.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
        photoPreview.hidden = true;
        photoPreview.src = "";
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        this.value = "";
        photoPreview.hidden = true;
        return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", function () {
        photoPreview.src = reader.result;
        photoPreview.hidden = false;
    });

    reader.readAsDataURL(file);
});

function saveTrips() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

function getTripImage(destination) {
    const place = destination.toLowerCase().trim();

    if (place.includes("paris")) {
        return "paris.jpeg";
    }

    if (place.includes("bali")) {
        return "bali.jpg";
    }

    if (place.includes("kyoto")) {
        return "kyoto.webp";
    }

    if (place.includes("london")) {
        return "london.jpeg";
    }

    if (place.includes("dubai")) {
        return "dubai.jpeg";
    }

    if (place.includes("switzerland")) {
        return "switzerland.jpeg";
    }

    if (place.includes("japan") || place.includes("tokyo")) {
        return "japan.jpg";
    }

    return "";
}

function formatDate(date) {
    if (!date) {
        return "No date";
    }

    return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

function renderTrips() {
    tripList.innerHTML = "";

    if (trips.length === 0) {
        emptyState.hidden = false;
        return;
    }

    emptyState.hidden = true;

    trips.forEach(function (trip) {
        const article = document.createElement("article");

        article.className = "trip-card";

        article.innerHTML = `
            <figure>
                ${
                    trip.image
                        ? `<img src="${trip.image}" alt="${trip.destination}">`
                        : `<div class="trip-image-placeholder">No photo</div>`
                }

                <figcaption>${trip.title}</figcaption>
            </figure>

            <div class="trip-information">
                <header>
                    <h3>${trip.title}</h3>
                    <p>${trip.destination}</p>
                </header>

                <p class="trip-date">
                    ${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}
                </p>

                <section class="itinerary">
                    <h4>Trip details</h4>
                    <p>${trip.details || "No trip details added."}</p>
                    <p>Travelers: ${trip.travelers}</p>
                </section>

                <div class="trip-actions">
                    <button type="button" class="edit-trip" data-id="${trip.id}">
                        Edit
                    </button>

                    <button type="button" class="delete-trip" data-id="${trip.id}">
                        Delete
                    </button>
                </div>
            </div>
        `;

        const deleteButton = article.querySelector(".delete-trip");

        deleteButton.addEventListener("click", function () {
            const tripId = Number(this.dataset.id);

            const confirmed = confirm("Are you sure you want to delete this trip?");

            if (!confirmed) {
                return;
            }

            trips = trips.filter(function (trip) {
                return trip.id !== tripId;
            });

            saveTrips();
            renderTrips();
        });

        const editButton = article.querySelector(".edit-trip");

        editButton.addEventListener("click", function () {
            const tripId = Number(this.dataset.id);

            const trip = trips.find(function (trip) {
                return trip.id === tripId;
            });

            if (!trip) {
                return;
            }

            editingTripId = tripId;

            document.getElementById("trip-name").value = trip.title;
            document.getElementById("trip-destination").value = trip.destination;
            document.getElementById("trip-start").value = trip.startDate;
            document.getElementById("trip-end").value = trip.endDate;
            document.getElementById("trip-travelers").value = trip.travelers;
            document.getElementById("trip-details").value = trip.details;

            tripPhoto.value = "";

            if (trip.image && trip.image.startsWith("data:image")) {
                photoPreview.src = trip.image;
                photoPreview.hidden = false;
            } else {
                photoPreview.src = "";
                photoPreview.hidden = true;
            }

            tripForm.querySelector("button[type='submit']").textContent = "Save changes";

            tripModal.hidden = false;
        });

        tripList.appendChild(article);
    });
}

openTripForm.addEventListener("click", function () {
    editingTripId = null;

    tripForm.reset();

    document.getElementById("trip-travelers").value = 1;

    tripForm.querySelector("button[type='submit']").textContent = "Create trip";

    tripModal.hidden = false;
});

closeTripForm.addEventListener("click", function () {
    tripModal.hidden = true;
});

tripModal.addEventListener("click", function (event) {
    if (event.target === tripModal) {
        tripModal.hidden = true;
    }
});

tripForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("trip-name").value.trim();
    const destination = document.getElementById("trip-destination").value.trim();
    const startDate = document.getElementById("trip-start").value;
    const endDate = document.getElementById("trip-end").value;
    const travelers = document.getElementById("trip-travelers").value;
    const details = document.getElementById("trip-details").value.trim();
    const file = tripPhoto.files[0];

    if (new Date(endDate) < new Date(startDate)) {
        alert("End date cannot be before start date.");
        return;
    }

    function saveTrip(image) {
        if (editingTripId !== null) {
            trips = trips.map(function (trip) {
                if (trip.id === editingTripId) {
                    return {
                        ...trip,
                        title: title,
                        destination: destination,
                        startDate: startDate,
                        endDate: endDate,
                        travelers: Number(travelers),
                        details: details,
                        image: image
                    };
                }

                return trip;
            });
        } else {
            const newTrip = {
                id: Date.now(),
                title: title,
                destination: destination,
                startDate: startDate,
                endDate: endDate,
                travelers: Number(travelers),
                details: details,
                image: image
            };

            trips.push(newTrip);
        }

        saveTrips();
        renderTrips();

        tripForm.reset();
        document.getElementById("trip-travelers").value = 1;

        photoPreview.hidden = true;
        photoPreview.src = "";

        editingTripId = null;

        tripForm.querySelector("button[type='submit']").textContent = "Create trip";

        tripModal.hidden = true;
    }

    if (file) {
        const reader = new FileReader();

        reader.addEventListener("load", function () {
            saveTrip(reader.result);
        });

        reader.readAsDataURL(file);
    } else if (editingTripId !== null) {
        const existingTrip = trips.find(function (trip) {
            return trip.id === editingTripId;
        });

        saveTrip(existingTrip ? existingTrip.image : getTripImage(destination));
    } else {
        saveTrip(getTripImage(destination));
    }
});

renderTrips();