document.addEventListener("DOMContentLoaded", async function () {
  const selectedStayIndex = localStorage.getItem("selectedStayIndex");
  const allStays = JSON.parse(localStorage.getItem("searchResults"));
  console.log(selectedStayIndex);
  if (selectedStayIndex !== null && allStays) {
    const stayData = allStays[selectedStayIndex];
    const otherStayData = await allStays.filter(
      (stay) => stay.id !== stayData.id
    );
    console.log(stayData);
    console.log(otherStayData);

    if (stayData) {
      const photos = stayData.accommodation.photos;
      const description = stayData.accommodation.description;
      const { city_name, region, line_one } =
        stayData.accommodation.location.address;
      const { name, review_score, rating, amenities } = stayData.accommodation;
      const { cheapest_rate_currency, cheapest_rate_total_amount } = stayData;

      const image = document.getElementById("photo");

      image.innerHTML = "";
      image.innerHTML = `<img class="img-fluid rounded-xs" src="${photos[0].url}" alt="Image-Description">`;

      const hotelName = document.getElementById("hotel-name");
      hotelName.innerText = `${name}`;

      const hotelLocation = document.getElementById("hotel-location");
      hotelLocation.innerText = `${city_name}`;

      const fromAmout = document.getElementById("from-amount");
      fromAmout.innerText = `${cheapest_rate_currency} ${cheapest_rate_total_amount}`;

      const totalAmount = document.getElementById("total-amount");
      totalAmount.innerText = `${cheapest_rate_currency} ${cheapest_rate_total_amount}`;

      document.getElementById("bookingForm").addEventListener("submit", (event) => {
        event.preventDefault(); 

          // Pass flightNumber and departingAt to displayBookingConfirmation
          displayBookingConfirmation(
            name,
            city_name,
            region,
            line_one,
            cheapest_rate_total_amount,
            cheapest_rate_currency
          );
      });
    } else {
      console.log("No stay data found.");
    }
  } else {
    console.log("No stay data found.");
  }
});

async function fetchCurrenciesFromNowPayments() {
  try {
    const response = await fetch(
      "https://api.nowpayments.io/v1/full-currencies",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "YJA2X3S-KHRMN22-P97DR57-XMSHMQG",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.currencies;
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return [];
  }
}

document
  .getElementById("currencySearch")
  .addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const dropdown = document.getElementById("currencyDropdown");
    dropdown.innerHTML = ""; // Clear previous options

    if (searchTerm) {
      const filteredCurrencies = window.currencies.filter(
        (currency) =>
          currency.name.toLowerCase().includes(searchTerm) ||
          currency.code.toLowerCase().includes(searchTerm)
      );

      filteredCurrencies.forEach((currency) => {
        const option = document.createElement("a");
        option.href = "#";
        option.className = "dropdown-item d-flex align-items-center";
        option.innerHTML = `
            <img src="https://nowpayments.io/${currency.logo_url}" alt="${currency.name} logo" class="coin-logo mr-2" style="width: 20px; height: 20px;">
            <span>${currency.name} (${currency.code})</span>
          `;
        option.addEventListener("click", function () {
          document.getElementById("currencySearch").value = currency.ticker;
          dropdown.innerHTML = ""; // Clear dropdown
          dropdown.classList.remove("show");
        });
        dropdown.appendChild(option);
      });

      dropdown.classList.add("show");
    } else {
      dropdown.classList.remove("show");
    }
  });

function populateCurrencySelect(currencies) {
  // Save currencies to be used in the search filter
  window.currencies = currencies;

  // Ensure the dropdown is initially empty
  const dropdown = document.getElementById("currencyDropdown");
  dropdown.innerHTML = "";

  // Populate the dropdown with options
  currencies.forEach((currency) => {
    const option = document.createElement("a");
    option.href = "#";
    option.className = "dropdown-item d-flex align-items-center";
    option.innerHTML = `
          <img src="${currency.logo_url}" alt="${currency.name} logo" class="coin-logo mr-2" style="width: 20px; height: 20px;">
          <span>${currency.name} (${currency.code})</span>
        `;
    option.addEventListener("click", function () {
      document.getElementById("currencySearch").value = currency.ticker;
      dropdown.innerHTML = ""; // Clear dropdown
      dropdown.classList.remove("show");
    });
    dropdown.appendChild(option);
  });
}

// Function to handle booking form submission and send booking data
async function handleBooking(formData) {
  try {
    const response = await fetch(
      "https://nesterlify-server-6.onrender.com/api/stays-bookings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Booking data sent successfully:", responseData);

    document.getElementById("bookingForm").reset();
  } catch (error) {
    console.error("Error sending booking data:", error);
    alert("Error sending booking data. Please try again later.");
  }
}

// Function to estimate the price in cryptocurrency
async function estimatePriceInCrypto(amount, currencyFrom, currencyTo) {
  try {
    const response = await fetch(
      `https://api.nowpayments.io/v1/estimate?amount=${amount}&currency_from=${currencyFrom}&currency_to=${currencyTo}`,
      {
        method: "GET",
        headers: {
          "x-api-key": "EZVFYWZ-043MCG9-GEBY21T-ZG5WPBT",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Estimated price:", responseData);

    return responseData.estimated_amount;
  } catch (error) {
    console.error("Error estimating price:", error);
    throw error;
  }
}

// Function to create an invoice and get its ID
async function createInvoiceAndGetId(formData) {
  const invoiceData = {
    price_amount: formData.cheapest_rate_total_amount,
    price_currency: formData.cheapest_rate_currency, // Currency in which price amount is specified
    order_description: `Hotel ${formData.name} located in ${formData.city_name}`,
    pay_currency: formData.currency, // Currency in which the customer will pay
    ipn_callback_url: "https://yourcallbackurl.com", // Your IPN callback URL
    success_url: "https://yourwebsite.com/success", // Your success URL
    cancel_url: "https://yourwebsite.com/cancel", // Your cancel URL
    is_fixed_rate: true,
    is_fee_paid_by_user: false,
  };

  try {
    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "EZVFYWZ-043MCG9-GEBY21T-ZG5WPBT",
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Invoice created successfully:", responseData);

    // Extract the invoice ID and payment address from the response
    const invoiceId = responseData.id;
    const paymentAddress = responseData.pay_address; // Payment address

    console.log("Invoice ID:", invoiceId);
    console.log("Payment Address:", paymentAddress);

    return { invoiceId, paymentAddress }; // Return both the invoice ID and payment address
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
}

// Function to create a payment by invoice ID
async function createPaymentByInvoice(formData) {
  try {
    // Estimate the price in cryptocurrency
    // const estimatedCryptoAmount = await estimatePriceInCrypto(
    //   formData.cheapest_rate_total_amount,
    //   formData.cheapest_rate_currency,
    //   formData.currency
    // );

    // Create the invoice and get its ID and payment address
    const { invoiceId } = await createInvoiceAndGetId(formData);

    // Prepare the payment data
    const paymentData = {
      iid: invoiceId,
      pay_currency: formData.currency,
      order_description: `Hotel ${formData.name} located in ${formData.city_name}`,
      customer_email: formData.email,
      payout_extra_id: null,
    };

    const response = await fetch(
      "https://api.nowpayments.io/v1/invoice-payment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "EZVFYWZ-043MCG9-GEBY21T-ZG5WPBT",
        },
        body: JSON.stringify(paymentData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Payment created successfully:", responseData);

    // Display payment details on your site
    displayPaymentDetails(responseData);
  } catch (error) {
    console.error("Error creating payment:", error);
    // Handle error and inform user
  }
}

async function displayPaymentDetails(paymentData) {
  console.log(paymentData);
  const paymentModalContent = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Complete Your Payment</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Payment Address: ${paymentData.pay_address}</p>
            <p>Amount: ${paymentData.pay_amount} ${paymentData.pay_currency}</p>
            <p>Order Description: ${paymentData.order_description}</p>
            <p>Please send the payment to the above address or scan the QR code below.</p>
            <div id="qrcodeDiv">
            <img id="qrcode"/>
            </div> <!-- QR code will be inserted here -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    `;

  const paymentModal = document.createElement("div");
  paymentModal.classList.add("modal", "fade");
  paymentModal.innerHTML = paymentModalContent;

  document.body.appendChild(paymentModal);

  const bootstrapModal = new bootstrap.Modal(paymentModal);
  bootstrapModal.show();

  // Generate the QR code
  const QRimage = document.getElementById("qrcode");
  const qrCodeData = `${paymentData.pay_address}?amount=${paymentData.pay_amount}`;
  const dataUrl = await QRCode.toDataURL(qrCodeData);
  QRimage.src = dataUrl;
}

// Function to display booking confirmation modal and handle form submission
async function displayBookingConfirmation(
  name,
  city_name,
  region,
  line_one,
  cheapest_rate_total_amount,
  cheapest_rate_currency
) {
  

    let currency;

    const currencies = await fetchCurrenciesFromNowPayments();
    console.log(currencies);
    populateCurrencySelect(currencies);
    const currencySelectionModal = new bootstrap.Modal(
      document.getElementById("currencySelectionModal"),
      {
        backdrop: "static",
        keyboard: false,
      }
    );
    currencySelectionModal.show();

    document
      .getElementById("confirmCurrencyButton")
      .addEventListener("click", () => {
        currency = document.getElementById("currencySearch").value;
        if (!currency) {
          alert("Please select a currency.");
          return;
        }

        currencySelectionModal.hide();

        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const country = document.getElementById("country").value.trim();
        const tel = document.getElementById("tel").value.trim();
        const requirements = document.getElementById("requirements").value.trim();
        const email = document.getElementById("email").value.trim();

        const formData = {
          firstName,
          lastName,
          country,
          name,
          region,
          line_one,
          city_name,
          cheapest_rate_total_amount,
          cheapest_rate_currency,
          email,
          tel,
          requirements,
          currency, // Add selected currency to formData
        };

        const modalContent = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Booking Confirmation</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>Full Name: ${formData.firstName} ${formData.lastName}</p>
              <p>Country: ${formData.country}</p>
              <p>Hotel Name: ${formData.name}</p>
              <p>Hotel Location: ${formData.line_one} ${formData.city_name}, ${formData.region}</p>
              <p>Phone Number: ${formData.tel}</p>
              <p>Special Requirements: ${formData.requirements}</p>
              <p>Payment Currency: ${formData.currency}</p> <!-- Display selected currency -->
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" id="confirmReservation">Confirm Reservation</button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            </div>
          </div>
        </div>
      `;

        const modalElement = document.createElement("div");
        modalElement.classList.add("modal", "fade");
        modalElement.innerHTML = modalContent;

        document.body.appendChild(modalElement);

        const bootstrapModal = new bootstrap.Modal(modalElement);
        bootstrapModal.show();

        const confirmReservationButton = modalElement.querySelector(
          "#confirmReservation"
        );
        confirmReservationButton.addEventListener("click", async () => {
          try {
            bootstrapModal.hide();
            // Create the invoice and get its ID and payment address
            await createPaymentByInvoice(formData);
            handleBooking(formData);

            alert("Reservation confirmed!");
            bootstrapModal.hide();
          } catch (error) {
            console.error("Error confirming reservation:", error);
          }
        });
      });

}
