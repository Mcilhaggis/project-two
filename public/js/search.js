$(document).ready(() => {

    const restaurantsResults = document.getElementById("restaurantsResults");
    const activitiesResults = document.getElementById("activitiesResults");

    function getActivityResultAPI(city) {
        $.get("/api/activity", { city: city }).then((data) => {
            console.log(data);
            for (let i = 0; i < data.activities.length; i++) {
                // view activity name
                const activitiesName = document.createElement("h2");
                activitiesResults.appendChild(activitiesName);
                activitiesName.textContent = data.activities[i][0].name;
                // view activity photo
                const activitiesImage = document.createElement('img');
                activitiesImage.src = data.activities[i][0].photo;
                activitiesResults.appendChild(activitiesImage);
            }
        });
    }

    function getRestaurantAPI(city) {
        $.get("/api/restaurants", { city: city }).then((data) => {
            console.log(data);
            for (let i = 0; i < data.restaurants.length; i++) {
                // view restaurant name
                const restaurantsName = document.createElement("h2");
                restaurantsResults.appendChild(restaurantsName);
                restaurantsName.textContent = data.restaurants[i][0].name;
                // clickable link to take user to zomato restaurant photos page
                const restaurantsImage = document.createElement('a');
                const linkText = document.createTextNode("view photos");
                restaurantsImage.appendChild(linkText);
                restaurantsImage.title = "my title text";
                restaurantsImage.href = data.restaurants[i][0].photos;
                restaurantsImage.target = "_blank";
                document.getElementById("restaurantsResults").appendChild(restaurantsImage);

            }
        });
    }

    $("#create-form").on("submit", event => {
        event.preventDefault();
        const cityName = ca.value.trim();
        console.log(ca.value.trim());
        getRestaurantAPI(cityName);
        getActivityResultAPI(cityName);
        $("#ca").val('');

    });

    // // When the form is submitted, we validate there's an email and password entered
    // searchBtn.on("click", (e) => {
    //   e.preventDefault();
    //   const cityName = ca.val().trim();
    //   console.log("I've been clicked");
    //   console.log(cityName);

    // //   // If we have an email and password we run the loginUser function and clear the form
    // //   getRestaurantAPI('New York');
    // //   getActivityResultAPI('New York');

    // //   //Empty the search bar once search submitted
    // //   ca.val("");
    // // });
});