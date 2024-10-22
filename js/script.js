// URL de la API de OpenWeather
const apiKey = ""; // Reemplaza con tu clave de API
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?";

document.addEventListener("DOMContentLoaded", () => {
  const cityForm = document.getElementById("cityForm");
  const cityInput = document.getElementById("cityInput");
  const clearCityButton = document.getElementById("clearCity");
  const weatherInfo = document.getElementById("weatherInfo");
  const climateMessage = document.getElementById("climateMessage");
  const climateIcon = document.getElementById("climateIcon");
  const cityCards = document.getElementById("cityCards");

  // Ciudades por defecto
  const defaultCities = ["alamos", "obregon", "hermosillo", "nogales", "alaska"];
  let storedCities =
    JSON.parse(localStorage.getItem("cities")) || defaultCities;

  // Mostrar ciudades por defecto o almacenadas en localStorage
  displayCities(storedCities);

  // Cargar ciudad desde local storage si existe
  const storedCity = localStorage.getItem("city");
  if (storedCity) {
    getWeather(storedCity); // Obtener el clima de la ciudad almacenada
    cityForm.style.display = "none"; // Ocultar formulario
    clearCityButton.style.display = "block"; // Mostrar botón de borrar ciudad
  }

  // Manejar el envío del formulario principal
  cityForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
      localStorage.setItem("city", city); // Guardar ciudad en local storage
      getWeather(city);
      cityForm.style.display = "none"; // Ocultar formulario
      clearCityButton.style.display = "block"; // Mostrar botón de borrar ciudad
    }
  });

  // Función para obtener el clima de la ciudad
  async function getWeather(city) {
    const response = await fetch(
      `${apiUrl}q=${city}&appid=${apiKey}&lang=es&units=metric`
    );
    if (response.ok) {
      const data = await response.json();
      const temperature = data.main.temp;
      const weatherDescription = data.weather[0].description;
      const weatherId = data.weather[0].id;

      // Mostrar la temperatura y la descripción
      climateMessage.innerText = `El clima de ${city} es ${weatherDescription} con una temperatura de ${temperature}°C.`;

      // Asignar el ícono correspondiente según el clima
      climateIcon.innerHTML = getWeatherIcon(weatherId);
      weatherInfo.style.display = "block"; // Mostrar información del clima
    } else {
      alert("Ciudad no encontrada. Por favor intenta de nuevo.");
    }
  }

  // Función para obtener el ícono del clima
  function getWeatherIcon(weatherId) {
    if (weatherId >= 200 && weatherId < 300)
      return '<i class="bi bi-cloud-lightning"></i>'; // Tormenta

    if (weatherId >= 300 && weatherId < 400)
      return '<i class="bi bi-cloud-drizzle"></i>'; // Lluvia ligera
    if (weatherId >= 500 && weatherId < 600)
      return '<i class="bi bi-cloud-rain"></i>'; // Lluvia
    if (weatherId >= 600 && weatherId < 700)
      return '<i class="bi bi-cloud-snow"></i>'; // Nieve
    if (weatherId >= 700 && weatherId < 800)
      return '<i class="bi bi-cloud-fog"></i>'; // Niebla
    if (weatherId === 800) return '<i class="bi bi-sun"></i>'; // Cielo despejado
    if (weatherId > 800) return '<i class="bi bi-cloud"></i>'; // Nubes
    return '<i class="bi bi-question-circle"></i>'; // Desconocido
  }

  // Mostrar ciudades como cards
  async function displayCities(cities) {
    cityCards.innerHTML = ""; // Limpiar contenedor de cards

    // Ordenar alfabéticamente
    cities.sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

    // Crear una card para cada ciudad
    for (const city of cities) {
      const card = document.createElement("div");
      card.className = "col";
      const weatherData = await fetchCityWeather(city);
      const temperature = weatherData.temp;
      const weatherIcon = getWeatherIcon(weatherData.weather); // Obtener el ícono adecuado

      card.innerHTML = `
            <div class="card h-100 text-center p-3">
                <div class="card-body">
                    <h5 class="card-title mt-3">${city}</h5>
                    <div class="temperature mt-3 fs-4">
                        <i class="bi bi-thermometer-half"></i> ${temperature}°C
                    </div>
                </div>
            </div>
        `;
      cityCards.appendChild(card);
    }

    // Crear una card vacía para agregar una nueva ciudad
    const emptyCard = document.createElement("div");
    emptyCard.className = "col";
    emptyCard.innerHTML = `
        <div class="card h-100 text-center p-3" id="addCityCard">
            <div class="card-body">
                <h5 class="card-title">Agregar Ciudad</h5>
                <div class="fs-1"><i class="bi bi-plus-circle"></i></div>
            </div>
        </div>
    `;
    cityCards.appendChild(emptyCard);

    // Manejar el click en la card vacía
    emptyCard.addEventListener("click", () => {
      const newCity = prompt("Ingresa el nombre de la nueva ciudad:");
      if (newCity) {
        cities.push(newCity.trim());
        localStorage.setItem("cities", JSON.stringify(cities));
        displayCities(cities); // Volver a mostrar las ciudades
      }
    });
  }

  // Función para obtener la temperatura de la ciudad
  async function fetchCityTemperature(city) {
    try {
      const response = await fetch(
        `${apiUrl}q=${city}&appid=${apiKey}&lang=es&units=metric`
      );
      const data = await response.json();
      return data.main.temp;
    } catch (error) {
      return "N/A"; // En caso de error, no se puede obtener la temperatura
    }
  }

  // Borrar la ciudad almacenada
  clearCityButton.addEventListener("click", () => {
    localStorage.removeItem("city");
    location.reload();
  });

  // Función para obtener el clima y la temperatura de la ciudad
  async function fetchCityWeather(city) {
    try {
      const response = await fetch(
        `${apiUrl}q=${city}&appid=${apiKey}&lang=es&units=metric`
      );
      const data = await response.json();
      return {
        temp: data.main.temp,
        weather: data.weather[0].main,
      };
    } catch (error) {
      return {
        temp: "N/A",
        weather: "N/A",
      }; // En caso de error, no se puede obtener el clima
    }
  }

  // Función para encontrar y mostrar la ciudad con mayor temperatura
  async function displayHottestCity(cities) {
    let hottestCity = null;
    let highestTemp = -Infinity;

    // Recorrer todas las ciudades y encontrar la de mayor temperatura
    for (const city of cities) {
      const weatherData = await fetchCityWeather(city);
      if (weatherData.temp > highestTemp) {
        highestTemp = weatherData.temp;
        hottestCity = {
          name: city,
          temp: weatherData.temp,
          weather: weatherData.weather,
          weatherId: weatherData.weatherId,
        };
      }
    }

    if (hottestCity) {
      const hottestCityCard = document.getElementById("hottestCityCard");
      hottestCityCard.innerHTML = `
            <div class="card text-center p-4 shadow-lg" style="width: 18rem;">
                <div class="card-body">
                    <h3 class="card-title mt-3">${hottestCity.name}</h3>
                    <div class="temperature mt-3 fs-4">
                        <i class="bi bi-thermometer-half"></i> ${hottestCity.temp}°C
                    </div>
                </div>
            </div>
        `;
    }
  }

  // Llamada para mostrar la ciudad con mayor temperatura después de cargar todas las ciudades
  async function initDisplay() {
    const cities = JSON.parse(localStorage.getItem("cities")) || defaultCities;

    // Mostrar la ciudad con mayor temperatura
    await displayHottestCity(cities);
  }

  initDisplay();
});
