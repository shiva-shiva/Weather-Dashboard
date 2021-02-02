
var allCity;

if (localStorage.getItem("allCity")) {
    allCity = localStorage.getItem("allCity");
    allCity = JSON.parse(allCity);
} else {
    allCity = [{ Name: "toronto" }];
    showCityWeather("toronto");
}

async function searchCity(event) {
    event.preventDefault()
    var cityName = document.querySelector("#search").value
    if (!validateInput(cityName)) {
        return
    }


    var city = { Name: cityName };
    allCity.push(city);
    var newcity = JSON.stringify(allCity)
    localStorage.setItem("allCity", newcity);

    showCityWeather(cityName);
}

addToCityList();



function validateInput(cityName) {

    if (cityName == '') {
        return false;
    }
    for (i = 0; i < allCity.length; i++) {
        if (cityName == allCity[i].Name) {
            console.log(cityName)
            return false;
        }
    }
    return true;
}

async function showCurrentWeather(cityName) {
    await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=0760f394c6c1040637252f958f788009`)
        .then(r => r.json()).then(
            function (response) {
                if (response.cod) {
                    console.log(response)

                    let currentWeatherIcon = "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
                    let currentTimeUTC = response.dt;
                    let currentTimeZoneOffset = response.timezone;
                    let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
                    let currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);

                    document.querySelector(".weatheForm").innerHTML = ` <h3 id="headerName">${response.name}${currentMoment.format("(MM/DD/YY)")}<img src="${currentWeatherIcon}"> </h3>
                       <p id="Tempeture" class="pStyle" >Tempeture: ${response.main.temp}&#8457</p>
                       <p id="Humidity" class="pStyle">Humidity: ${response.main.humidity}%</p>
                       <p id="WindSpeed" class="pStyle">Wind Speed: ${response.wind.speed}MPH</p>
                       <p id="uvIndex" class="pStyle">Uv Index: </p>`

                    let latitude = response.coord.lat;
                    let longitude = response.coord.lon;
                    let uvQueryURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&appid=0760f394c6c1040637252f958f788009";
                    //uvQueryURL = "https://cors-anywhere.herokuapp.com/" + uvQueryURL;
                    fetch(uvQueryURL)
                        .then((response) => {
                            return response.json();
                        })
                        .then((response) => {
                            let uvIndex = response.value;
                            $('#uvIndex').html(`UV Index: <span id="uvVal"> ${uvIndex}</span>`);
                            if (uvIndex >= 0 && uvIndex < 3) {
                                $('#uvVal').attr("class", "uv-favorable");
                            } else if (uvIndex >= 3 && uvIndex < 8) {
                                $('#uvVal').attr("class", "uv-moderate");
                            } else if (uvIndex >= 8) {
                                $('#uvVal').attr("class", "uv-severe");
                            }
                        });

                }
            })
}

async function showWeatherForecast(cityName) {

    await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=0760f394c6c1040637252f958f788009`)
        .then((response) => {
            return response.json();
        })
        .then((response) => {
            let fiveDayForecastHTML = `
       <h2>5-Day Forecast:</h2>
       <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;
            for (let i = 0; i < response.list.length; i++) {
                let dayData = response.list[i];
                let dayTimeUTC = dayData.dt;
                let timeZoneOffset = response.city.timezone;
                let timeZoneOffsetHours = timeZoneOffset / 60 / 60;
                let thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
                let iconURL = "https://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";
                // Only displaying mid-day forecasts
                if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
                    fiveDayForecastHTML += `
               <div class="weather-card card m-2 p0">
                   <ul class="list-unstyled p-3">
                       <li>${thisMoment.format("MM/DD/YY")}</li>
                       <li class="weather-icon"><img src="${iconURL}"></li>
                       <li>Temp: ${dayData.main.temp}&#8457;</li>
                       <br>
                       <li>Humidity: ${dayData.main.humidity}%</li>
                   </ul>
               </div>`;
                }
            }
            
            fiveDayForecastHTML += `</div>`;
            // Append the five-day forecast to the DOM
            $('#five-day-forecast').html(fiveDayForecastHTML);
        })
}


async function showCityWeather(cityName) {
    await showCurrentWeather(cityName);
    await showWeatherForecast(cityName);
    addToCityList();
}

function addToCityList() {
    if (allCity.length > 0) {
        document.querySelector("#listGroup").innerHTML = '';
        for (i = 0; i < allCity.length; i++) {
            document.querySelector("#listGroup").innerHTML += `<li class="list-group-item" onClick="showCityWeather(\'${allCity[i].Name}\')">${allCity[i].Name}</li>`;

        }

    }
}
