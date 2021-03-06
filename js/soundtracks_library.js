export {
    useSoundTracks,
    soundtracks_base,
    rated
};
var soundtracks_base;
var rated = [];
//If user loged in, get from LS songs for which he voted
if (/^logIn/.test(document.cookie)) {
    if (localStorage.getItem("rated")) {
        rated = JSON.parse(localStorage.getItem("rated"));
    } else {
        localStorage.setItem("rated", "[]");
    }

} else {
    localStorage.setItem("rated", "[]");
}

async function ajax_soundtracks() {
    return new Promise(function (resolve, reject) {
        let xhr2 = new XMLHttpRequest();
        xhr2.onreadystatechange = function () {
            if (xhr2.readyState == 4 && xhr2.status == 200) {
                resolve(xhr2.responseText);
            }
        }
        xhr2.open('GET', 'soundtracks_base.json');
        xhr2.send();
    })

}

(async () => {
    let data;
    if (!localStorage.getItem("soundtracks_base")) {
        data = await ajax_soundtracks();
        localStorage.setItem("soundtracks_base", data);
    } else {
        data = localStorage.getItem("soundtracks_base");
    }
    soundtracks_base = JSON.parse(data);
    useSoundTracks();
})();



//Main function to work with scountracks data
function useSoundTracks(filtred) {

    let soundtracks_array; //temporary storage for the data that will be displayed to the user



    if (filtred === undefined) {
        document.getElementsByClassName("library__top-back")[0].classList.toggle("hidden", true);
        soundtracks_array = soundtracks_base.slice();
    } else {
        document.getElementsByClassName("library__top-back")[0].classList.toggle("hidden", false);
        soundtracks_array = filtred;
    }
    //Save a copy of the displayed content in LS to sort it later if needed
    localStorage.setItem("soundtrack_array", JSON.stringify(soundtracks_array));

    let max_page = Math.ceil(soundtracks_array.length / 10),
        controls_list = document.querySelector(".library__bottom-controls"),
        pages = Math.ceil(soundtracks_array.length / 10) >= 5 ? 5 : Math.ceil(soundtracks_array.length / 10);


    //Redrawing pagination controls elements
    if (controls_list.hasChildNodes()) {
        while (controls_list.firstChild) {
            controls_list.removeChild(controls_list.firstChild);
        }
    }
    if (pages > 1) {
        let first_li = document.createElement("li");
        first_li.className = "library__bottom-beginning-btn";
        controls_list.appendChild(first_li).innerText = "< First page";

        for (let i = 1; i <= pages; i++) {
            let li = document.createElement("li"),
                btn = document.createElement("button");

            li.className += "controls-btn";
            btn.className = "library__bottom-controlsItem";
            li.appendChild(btn).innerText = i;
            controls_list.appendChild(li);
        }

        let last_li = document.createElement("li");
        last_li.className = "library__bottom-end-btn";
        controls_list.appendChild(last_li).innerText = "Last page >";
    }


    let library_titles = document.querySelectorAll(".library__main-title"),
        library_audio = document.querySelectorAll(".library__main-audio"),
        library_controls = document.querySelectorAll(".library__bottom-controlsItem"),
        library_containers = document.getElementsByClassName("library__main-item"),
        rate_container = document.getElementsByClassName("library__main-rate"),
        rate_input = document.getElementsByClassName("library__main-checkbox"),
        rate_text = document.getElementsByClassName("library__main-rated"),
        no_mutches = document.getElementsByClassName("library__main-nomatches")[0];

    //Function for rewriting innerText of controls when user click on it
    function controllersRedrawing(left_shift, basic_page, active_e) {
        let counter = left_shift;
        library_controls.forEach(function (e) {
            if (e.classList.contains("library__bottom-controlsItem-active")) {
                e.className = "library__bottom-controlsItem";
            }
            e.innerText = basic_page + counter;
            counter++;
        })
        library_controls[active_e].className += "-active";
    }


    //The function to displays songs according to the request on the page
    function displayContent(array) {
        if (/^logIn/.test(document.cookie)) {
            for (let i = 0; i < rate_input.length; i++) {
                rate_input[i].checked = false;
            }
        }
        for (let i = 0; i < 10; i++) {
            if (array[i] === undefined) {
                library_containers[i].classList.toggle("none", true);
            } else {
                no_mutches.classList.toggle("none", true);
                rate_container[i].setAttribute("data-track", array[i].trackName);

                library_containers[i].classList.toggle("none", false);
                library_titles[i].innerText = array[i].trackName;
                library_audio[i].setAttribute("src", array[i].src);

                if (/^logIn/.test(document.cookie)) {
                    rate_container[i].classList.toggle("none", false);
                    if (rated.length !== 0) {
                        if (rated.indexOf(array[i].trackName) !== -1) {
                            rate_container[i].classList.toggle("none", true);
                            rate_text[i].innerText = "Voted!"
                        } else {
                            rate_text[i].innerText = "";
                        }
                    }
                } else {
                    rate_container[i].classList.toggle("none", true);
                }

            }
            //If no search results, then show message and if user in not on main library, then show him 'Back to main library' button
            if (array.length === 0) {
                no_mutches.classList.toggle("none", false);

            }

        }

    }

    // Display songs and their names on a page
    displayContent(soundtracks_array);

    //Added '-active' class to set up defoult chosed controler
    library_controls[0] === undefined ? true : library_controls[0].className += "-active";


    //Added event on all library controls (pagination functionality)
    for (let i = 0; i < library_controls.length; i++) {

        library_controls[i].onclick = (e) => {

            let curent_page = +e.target.innerText,
                soundtracks_count = library_controls[i].innerText + 0,
                show_on_page = soundtracks_array.slice(+soundtracks_count - 10, +soundtracks_count);

            displayContent(show_on_page);

            //Redrawing Controls when user click on it
            if (curent_page === max_page) {
                for (let i = 0; i < library_controls.length; i++) {
                    if (library_controls[i].classList.contains("library__bottom-controlsItem-active")) {
                        library_controls[i].className = "library__bottom-controlsItem";
                    }
                }
                e.target.className += "-active"

            } else if (max_page - curent_page === 1) {
                if (library_controls.length < 5) {
                    for (let i = 0; i < library_controls.length; i++) {
                        if (library_controls[i].classList.contains("library__bottom-controlsItem-active")) {
                            library_controls[i].className = "library__bottom-controlsItem";
                        }
                    }
                    library_controls[library_controls.length - 2].className += "-active";
                } else {

                    controllersRedrawing(-4, max_page, 3);

                }

            } else if (curent_page >= 3) {

                controllersRedrawing(-2, curent_page, 2);

            } else if (curent_page === 2) {

                controllersRedrawing(1, 0, 1);

            } else {
                for (let i = 0; i < library_controls.length; i++) {
                    if (library_controls[i].classList.contains("library__bottom-controlsItem-active")) {
                        library_controls[i].className = "library__bottom-controlsItem";
                    }
                }
                e.target.className += "-active"
            }

        }
    }
    //Event for first\last page button's, if they are on a page
    if (document.querySelector(".library__bottom-beginning-btn")) {

        document.querySelector(".library__bottom-beginning-btn").onclick = () => {
            displayContent(soundtracks_array);
            controllersRedrawing(1, 0, 0);
        }
        document.querySelector(".library__bottom-end-btn").onclick = (e) => {
            let tracks_count = soundtracks_array.length % 10 === 0 ? 10 : soundtracks_array.length % 10,
                show_on_page = soundtracks_array.slice(-tracks_count);

            displayContent(show_on_page);

            if (library_controls.length === 5) {
                controllersRedrawing(-4, max_page, 4);
            } else {
                for (let i = 0; i < library_controls.length; i++) {
                    if (library_controls[i].classList.contains("library__bottom-controlsItem-active")) {
                        library_controls[i].className = "library__bottom-controlsItem";
                    }
                }
                library_controls[library_controls.length - 1].className += "-active";
            }

        }

    }
}