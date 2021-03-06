const SOUNDTRACKS_DATA = require('./soundtracks_library.js');

document.addEventListener("DOMContentLoaded", () => {
    let rate_container = document.getElementsByClassName("library__main-rate"),
        rate_input = document.getElementsByClassName("library__main-checkbox"),
        rate_text = document.getElementsByClassName("library__main-rated"),
        rating,
        rate_track,
        curent_index;

//On click oт container, get the index of the element and the song voted for
    for (let i = 0; i < rate_container.length; i++) {
        rate_container[i].onclick = () => {
            rate_track = rate_container[i].dataset.track;
            curent_index = i;
        }
    }

    //On the same click,get the rating that the user put,add it to the database, and save a state of a song as voted
    for (let i = 0; i < rate_input.length; i++) {
        rate_input[i].onchange = () => {
            rating = rate_input[i].dataset.rating;

            SOUNDTRACKS_DATA.soundtracks_base.map(element => element.trackName === rate_track ? element.rating.push(rating) : false);

            rate_container[curent_index].className += " none";
            rate_text[curent_index].innerText = "Voted!";
            SOUNDTRACKS_DATA.rated.push(rate_track);

            try {
                localStorage.setItem("rated", JSON.stringify(SOUNDTRACKS_DATA.rated));
            } catch (error) {
                alert(error.name)
            }
        }
    }

})