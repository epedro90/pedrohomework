const searchForm = document.getElementById("search-form")
const searchInput = document.getElementById("search-input")
const clock = document.getElementById("clock")
const timeEl = document.getElementById("time")
const dateEl = document.getElementById("date")
const greetingEl = document.getElementById("greeting")
const weatherLocations = [
  { label: "Ferrara", latitude: 44.8381, longitude: 11.6198, gridId: "weather-grid-ferrara" },
  { label: "Bologna", latitude: 44.4949, longitude: 11.3426, gridId: "weather-grid-bologna" },
]

const weatherCodes = {
  0: ["Sereno", "☀"],
  1: ["Preval. sereno", "🌤"],
  2: ["Parz. nuvoloso", "⛅"],
  3: ["Nuvoloso", "☁"],
  45: ["Nebbia", "🌫"],
  48: ["Nebbia", "🌫"],
  51: ["Pioviggine", "🌦"],
  53: ["Pioviggine", "🌦"],
  55: ["Pioviggine", "🌦"],
  61: ["Pioggia", "🌧"],
  63: ["Pioggia", "🌧"],
  65: ["Pioggia forte", "🌧"],
  71: ["Neve", "🌨"],
  73: ["Neve", "🌨"],
  75: ["Neve forte", "🌨"],
  80: ["Rovesci", "🌦"],
  81: ["Rovesci", "🌦"],
  82: ["Rovesci forti", "⛈"],
  95: ["Temporale", "⛈"],
  96: ["Temporale", "⛈"],
  99: ["Temporale", "⛈"],
}

const searchRoutes = {
  yt: "https://www.youtube.com/results?search_query=",
  youtube: "https://www.youtube.com/results?search_query=",
  maps: "https://www.google.com/maps/search/",
  map: "https://www.google.com/maps/search/",
  mail: "https://mail.google.com/mail/u/0/#search/",
  gmail: "https://mail.google.com/mail/u/0/#search/",
}

function buildSearchUrl(value) {
  const query = value.trim()

  if (!query) {
    return "https://www.google.com/"
  }

  const parts = query.split(/\s+/)
  const command = parts[0].toLowerCase()
  const commandQuery = parts.slice(1).join(" ")

  if (searchRoutes[command] && commandQuery) {
    return searchRoutes[command] + encodeURIComponent(commandQuery)
  }

  return "https://www.google.com/search?q=" + encodeURIComponent(query)
}

searchForm?.addEventListener("submit", function (event) {
  event.preventDefault()
  window.location.href = buildSearchUrl(searchInput?.value || "")
})

function updateClock() {
  const now = new Date()
  const hour = now.getHours()

  if (timeEl) {
    timeEl.textContent = now.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  if (clock) {
    clock.dateTime = now.toISOString()
  }

  if (greetingEl) {
    if (hour < 12) {
      greetingEl.textContent = "Buongiorno Pedro"
    } else if (hour < 18) {
      greetingEl.textContent = "Buon pomeriggio Pedro"
    } else {
      greetingEl.textContent = "Buonasera Pedro"
    }
  }
}

function getWeatherInfo(code) {
  return weatherCodes[code] || ["Variabile", "☁"]
}

function formatWeatherDay(value, index) {
  if (index === 0) {
    return "Oggi"
  }

  return new Date(value).toLocaleDateString("it-IT", {
    weekday: "short",
    day: "numeric",
  })
}

function renderWeather(data, location) {
  const weatherGrid = document.getElementById(location.gridId)
  if (!weatherGrid || !data.daily) {
    return
  }

  const daily = data.daily

  weatherGrid.innerHTML = daily.time
    .map(function (day, index) {
      const weather = getWeatherInfo(daily.weather_code[index])
      const min = Math.round(daily.temperature_2m_min[index])
      const max = Math.round(daily.temperature_2m_max[index])
      const rain = daily.precipitation_probability_max?.[index] ?? 0

      return `
        <article class="weather-card${index === 0 ? " today" : ""}">
          <div>
            <div class="weather-day">${formatWeatherDay(day, index)}</div>
            <div class="weather-icon" aria-hidden="true">${weather[1]}</div>
          </div>
          <div>
            <div class="weather-temp">${max}° / ${min}°</div>
            <div class="weather-desc">${weather[0]}</div>
            <div class="weather-rain">Pioggia ${rain}%</div>
          </div>
        </article>
      `
    })
    .join("")

}

function renderWeatherError(location) {
  const weatherGrid = document.getElementById(location.gridId)
  if (weatherGrid) {
    weatherGrid.innerHTML = '<div class="weather-state">Meteo non disponibile.</div>'
  }
}

async function loadWeather(location) {
  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    current: "temperature_2m,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "6",
  })

  try {
    const response = await fetch("https://api.open-meteo.com/v1/forecast?" + params.toString())

    if (!response.ok) {
      throw new Error("Weather request failed")
    }

    renderWeather(await response.json(), location)
  } catch {
    renderWeatherError(location)
  }
}

function initWeather() {
  weatherLocations.forEach(loadWeather)
}

document.addEventListener("keydown", function (event) {
  const activeElement = document.activeElement
  const isTyping = activeElement && ["INPUT", "TEXTAREA"].includes(activeElement.tagName)

  if (event.key === "/" && !isTyping) {
    event.preventDefault()
    searchInput?.focus()
    return
  }

  if (isTyping || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return
  }

  const shortcutKey = event.key.toLowerCase()
  const shortcut = document.querySelector(`[data-key="${shortcutKey}"]`)

  if (shortcut instanceof HTMLAnchorElement) {
    window.location.href = shortcut.href
  }
})

updateClock()
setInterval(updateClock, 30000)
initWeather()

const random = Math.floor(Math.random() * 15) + 1
document.body.style.backgroundImage = "url(bg" + random + ".jpg)"
