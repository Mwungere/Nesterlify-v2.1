async function searchStays(rooms, longitude, latitude, checkInDate, checkOutDate, guests) {
  try {
    const response = await fetch('https://nesterlify-server-6.onrender.com/api/search-stays', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rooms: rooms,
        location: {
          radius: 30,
          geographic_coordinates: {
            longitude: longitude,
            latitude: latitude
          }
        },
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        guests: guests
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.results;
  } catch (error) {
    console.error('Error searching stays:', error);
    return [];
  }
}

async function getCoordinates(city, country) {
  const apiKey = 'a4932359feec4dee854cd7699665b2ce';
  const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${city}+${country}&key=${apiKey}`);
  const data = await response.json();
  if (data.results.length > 0) {
    return data.results[0].geometry;
  } else {
    throw new Error('Location not found');
  }
}

function generateGuestsArray(guestsCount) {
  const guestsArray = [];
  for (let i = 0; i < guestsCount; i++) {
    guestsArray.push({ type: 'adult' });
  }
  return guestsArray;
}



async function handleStaysSearch(event){
  event.preventDefault();
  console.log('submitted');
  const location = document.getElementById('location').value.trim();
  const [city, country] = location.split(',').map(part=> part.trim());
  const rooms = document.getElementById('rooms').value.trim();
  const checkInOut = document.getElementById('checkInOut').value.trim();
  const guests = document.getElementById('guests').value.trim()
  console.log(checkInOut);


  // Function to parse and format the date
  function formatDate(dateStr) {
    const [month, day, year] = dateStr.split(/[\/ ]/).filter(Boolean);
    const date = new Date(`${month} ${day}, ${year}`);
    const yearFormatted = date.getFullYear();
    const monthFormatted = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based in JS
    const dayFormatted = String(date.getDate()).padStart(2, "0");
    return `${yearFormatted}-${monthFormatted}-${dayFormatted}`;
  }

  // Extract depart and return dates
  const [checkInDateStr, checkOutDateStr] = checkInOut.split("-").map((date) => date.trim());
  const checkInDate = formatDate(checkInDateStr);
  const checkOutDate = formatDate(checkOutDateStr);

  console.log(checkInDate, checkOutDate);

  const coordinates = await getCoordinates(city, country);
  const latitude = coordinates.lat;
  const longitude = coordinates.lng;
  console.log(latitude, longitude);
  const guestsArray = generateGuestsArray(guests);
  const response = await searchStays(rooms, longitude, latitude, checkInDate, checkOutDate, guestsArray)
  console.log(response);

}

// Function to get tomorrow's date in YYYY-MM-DD format
function getTomorrowDate() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return tomorrow.toISOString().split('T')[0]; // Format the date as YYYY-MM-DD
}

// Function to get the date five days after tomorrow in YYYY-MM-DD format
function getDateAfterFiveDays(tomorrowDate) {
  const tomorrow = new Date(tomorrowDate);
  const fiveDaysLater = new Date(tomorrow);
  fiveDaysLater.setDate(tomorrow.getDate() + 5);
  return fiveDaysLater.toISOString().split('T')[0]; // Format the date as YYYY-MM-DD
}


document.addEventListener('DOMContentLoaded', async () => {
  const offersContainer = document.getElementById('stays-container');
  const maxRooms = 15; // Adjust the maximum number of rooms to display

  try {
    const checkInDate = getTomorrowDate();
    const checkOutDate = getDateAfterFiveDays(checkInDate);

    const results = await searchStays(3, -0.1416, 51.5071,  checkInDate, checkOutDate, [{ type: 'adult' }, { type: 'adult' },{ type: 'adult' },{ type: 'adult' },{ type: 'adult' },{ type: 'adult' }]) // Fetch the search results

    offersContainer.innerHTML = '';

    if (results && results.length > 0) {
      // Store all stays in localStorage
      localStorage.setItem('allStays', JSON.stringify(results));

      results.slice(0, maxRooms).forEach((accommodation, index) => {
        const roomCard = createRoomCard(accommodation, index); // Create a room card based on the returned data
        offersContainer.appendChild(roomCard);
      });

      // Add event listeners to the stay cards
      document.querySelectorAll('.stay-card a').forEach((link, index) => {
        link.addEventListener('click', function(event) {
          localStorage.setItem('selectedStayIndex', index);
        });
      });
    } else {
      offersContainer.innerHTML = '<p>No accommodations found!</p>';
    }
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    offersContainer.innerHTML = `<p>Error fetching accommodations: ${error.message}</p>`;
  }
});

// Function to create a room card
function createRoomCard(stay, index) {
  const { cheapest_rate_currency, cheapest_rate_total_amount } = stay;
  const { city_name, region, line_one } = stay.accommodation.location.address;
  const { name, review_score, rating } = stay.accommodation;
  const { url } = stay.accommodation.photos[0];
  
  const roomCard = document.createElement('div');
  roomCard.classList.add('col-md-6', 'col-lg-4', 'mb-3', 'mb-md-4', 'pb-1', 'wow', 'fadeInUp');
  roomCard.setAttribute('data-wow-delay', '0.1s');
  roomCard.classList.add('stay-card');

  roomCard.innerHTML = `
     <div class="card transition-3d-hover shadow-hover-2 tab-card h-100">
       <div class="position-relative">
         <a href="/html/hotels/hotel-single-v1.html" class="d-block gradient-overlay-half-bg-gradient-v5">
           <img class="min-height-230 bg-img-hero card-img-top" src="${url}" alt="img">
         </a>
         <div class="position-absolute bottom-0 left-0 right-0">
           <div class="px-4 pb-3">
             <a href="/html/hotels/hotel-single-v1.html" class="d-block">
               <div class="d-flex align-items-center font-size-14 text-white">
                 <i class="icon flaticon-pin-1 mr-2 font-size-20"></i> ${line_one}, ${city_name}
               </div>
             </a>
           </div>
         </div>
       </div>
       <div class="card-body pl-3 pr-4 pt-2 pb-3">
         <div class="ml-1 mb-2">
           <div class="d-inline-flex align-items-center font-size-13 text-lh-1 text-primary letter-spacing-3">
             <div class="green-lighter">
               <small class="fas fa-star"></small>
               <small class="fas fa-star"></small>
               <small class="fas fa-star"></small>
               <small class="fas fa-star"></small>
               <small class="fas fa-star"></small>
             </div>
           </div>
         </div>
         <a href="/html/hotels/hotel-single-v1.html" class="card-title font-size-17 font-weight-medium text-dark">${name}</a>
         <div class="mt-2 mb-3">
           <span class="badge badge-pill badge-primary py-1 px-2 font-size-14 border-radius-3 font-weight-normal">${rating}/5</span>
           <span class="font-size-14 text-gray-1 ml-2">(${review_score}/10 reviews)</span>
         </div>
         <div class="mb-0">
           <span class="mr-1 font-size-14 text-gray-1">From</span>
           <span class="font-weight-bold">${cheapest_rate_currency} ${cheapest_rate_total_amount}</span>
           <span class="font-size-14 text-gray-1"> / night</span>
         </div>
       </div>
     </div>
  `;

  return roomCard;
}
