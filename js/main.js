/**
 * Script principal de la page et du jeu
 *
 * @author Heddi Brahiti <heddi@brahiti.fr>
 */

// On écoute l'événement DOMContentLoaded qui se déclenche quand la page a fini de charger
document.addEventListener("DOMContentLoaded", () => {
    console.log("--- Initialisation de la page ---");
    // Appel de la fonction animateCSS() sur l'élément id welcome pour faire l'animation zoomIn
    animateCSS("#welcome", "zoomIn");
});

// On écoute l'événement click sur l'élément start qui est le bouton pour démarrer la partie
document.getElementById("start").addEventListener("click", () => {
    console.log("---  Démarrage du jeu ---");
    // Appel de la fonction animateCSS() sur l'élément id welcome pour faire l'animation bounceOutUp
    animateCSS("#welcome", "bounceOutUp", () => {
        // Après l'animation on met cet élément en display: none
        document.getElementById("welcome").style.display = "none";

        console.log("--- Extinction des lumières ---");
        // On change la classe du container
        document.querySelector(".container").classList.add("color-back");
        // et on met les trois éléments ci-dessous en display: block car ils étaient de base en display: none
        document.getElementById("game").style.display = "block";
        document.getElementById("gameinfo").style.display = "block";
        document.getElementById("turn").style.display = "block";
        // Appel de la fonction animateCSS() sur l'élément id game pour faire l'animation fadeIn
        animateCSS("#game", "fadeIn");
        // On lance la partie !
        startGame();
    });
});

/* Objet game, définitions de toutes les propriétes qu'on va changer dans le futur */
let game = {
    round: 0,
    score: 0,
    speed: 1,
    maxSpeed: 8,
    possibilities: ["#green", "#blue", "#red", "#yellow"],
    currentGame: [],
    player: [],
    playerTurn: false,
    sound: {
        blue: new Audio("../sounds/do.wav"),
        red: new Audio("../sounds/re.wav"),
        yellow: new Audio("../sounds/mi.wav"),
        green: new Audio("../sounds/fa.wav"),
    },
};

/**
 * Fonction qui permet de reprendre une partie à 0, elle est utilisée par le bouton reset et par le démarrage d'une partie
 */
function resetGame() {
    console.log("--- Reset de la partie ---");
    // On remet les propriétés de l'objet game à leur états initiaux
    game.currentGame = [];
    game.round = 0;

    // On ajoute un round à la partie, c'estle round de début
    addRound();
    // On reset le score de la partie
    resetScore();
}

/**
 * Cette fonction démarre la partie en faisant un reset de la partie (ça sonne bizarre en effet)
 */
function startGame() {
    // On appelle la fonction resetGame()
    resetGame();
}

/**
 * Cette fonction permet de montrer au joueur les cases sur lesquelles il faut cliquer
 */
function showMoves() {
    // On défini un index qui sera les cases a incrémenter
    let i = 0;
    // On défini une fonction qui se répète pour afficher chaque cases
    let moves = setInterval(function () {
        // Appel de la fonction playButton pour simuler l'appui sur la case
        playButton(game.currentGame[i]);
        // On met à jour l'index des cases à jouer
        i++;
        // Si l'index est supérieur ou égal au total des cases que doit jouer l'IA, on arrête et c'est au joueur de jouer
        if (i >= game.currentGame.length) {
            // On clear le setInterval
            clearInterval(moves);
            // On met à jour le tour de jeu pour le joueur
            updatePlayerTurn(true);
        }
        // J'ai pas trouvé mieux pour augmenter la vitesse
    }, 600 - game.speed * 25);

    clearPlayer();
}

/**
 * Fonction qui permet de jouer un son en fonction de la case (id), les sons sont dans l'objet game
 */
function sound(name) {
    switch (name) {
        case "#green":
            game.sound.green.play();
            break;
        case "#blue":
            game.sound.blue.play();
            break;
        case "#red":
            game.sound.red.play();
            break;
        case "#yellow":
            game.sound.yellow.play();
            break;
    }
}

/**
 * Permet de simuler le clic d'une case
 */
function playButton(button) {
    // Fait un effet lighten pendant 300ms
    lightenTimeout(document.querySelector(button), 300);
    // Joue le son
    sound(button);
}

/**
 * Permet de reset la propriété player de l'objet game
 */
function clearPlayer() {
    game.player = [];
}

/**
 * Fonction qui permet d'exécuter le clic d'un joueur (effet lighten)
 */
function addToPlayer(id) {
    // Simon joue, donc on ne peut pas appuyer sur le bouton
    if (!game.playerTurn) {
        console.log("---- SIMON JOUE | LES BOUTONS SONT DÉSACTIVÉS ----");
        return;
    }
    let button = "#" + id;
    // On push dans le tableau
    game.player.push(button);
    // Effet lighten
    lightenTimeout(document.querySelector(button), 300);
    // Affichage de la note
    playerTurn(button);
}

/**
 * Logique principale du jeu, gère les tours de la partie
 */
function playerTurn(x) {
    // Si le dernier bouton cliqué à telle position du tableau est différent de celui de l'IA
    if (game.player[game.player.length - 1] !== game.currentGame[game.player.length - 1]) {
        console.log("--- PARTIE TERMINÉE | AFFICHAGE DU MODAL ---");
        // Récupère le modal avec son id
        let gameOverModal = document.getElementById("gameOverModal");

        // Récupère les éléments qui permettent la fermeture du modal
        let span = document.querySelector("#" + gameOverModal.id + " span");
        let reset = document.querySelector("#" + gameOverModal.id + " button");

        // Mise à jour graphique des valeurs
        document.getElementById("roundv").innerHTML = game.round;
        document.getElementById("clickv").innerHTML = game.score;

        // Affichage du modal
        gameOverModal.style.display = "block";

        // Ferme le modal quand on clique sur la croix
        span.onclick = function () {
            gameOverModal.style.display = "none";
        };

        // Ferme le modal quand on clique sur le bouton
        reset.onclick = function () {
            gameOverModal.style.display = "none";
            // Puis reset la partie
            setTimeout(() => {
                resetGame();
            }, 300);
        };

        // Quand on clique en dehors du modal, on le ferme aussi !
        window.onclick = function (event) {
            if (event.target == gameOverModal) {
                gameOverModal.style.display = "none";
            }
        };
        // resetGame(); // Reset de la partie quand même ?
    } else {
        // Le joueur n'a pas fait d'erreurs
        console.log("--- Bien joué la partie continue ---");
        // Mise à jour du score
        addScore();
        // On joue le son 'x' qui correspond à un id de case
        sound(x);

        // Ici on vérifie si le joueur est arrivé jusqu'à la fin du tour
        let check = game.player.length === game.currentGame.length;
        if (check) {
            console.log("--- Prochain round ---");
            nextRound();
        }
    }
}

/**
 * Lance le prochain round, en montant la vitesse de l'IA
 */
function nextRound() {
    // On monte la vitesse !!
    if (game.speed < game.maxSpeed) {
        game.speed++;
        console.log("--- Simon va de plus en plus vite ! ---");
    }
    // Mise à jour du round
    addRound();
}

/**
 * Génère les mouvements
 */
function generateMove() {
    // Tour de simon
    game.currentGame.push(game.possibilities[Math.floor(Math.random() * 4)]);
    setTimeout(() => {
        // Montre les mouvements
        showMoves();
    }, 600);
}

/**
 * Met à jour le tour du joueur, permet d'afficher qui doit jouer
 */
function updatePlayerTurn(playerTurn) {
    // On défini la valeur dans l'objet
    game.playerTurn = playerTurn;
    if (game.playerTurn) {
        // Tour du joueur
        document.querySelector("#turn p").innerHTML = "C'est à votre tour de JOUER !";
        animateCSS("#turn", "fadeIn");
    } else {
        // Tour de Simon
        document.querySelector("#turn p").innerHTML = "Simon est en train de JOUER...";
        animateCSS("#turn", "fadeIn");
    }
}

/**
 * Mise à jour du score
 */
function addScore() {
    // Incrémentation de la propriété score de l'objet game
    game.score++;
    // Dans 200ms, on animera et modifira la valeur graphique du score
    setTimeout(function () {
        document.getElementById("score").innerHTML = game.score;
        // Appel de la fonction animateCSS() sur l'élément id score pour faire l'animation bounceIn
        animateCSS("#score", "bounceIn");
    }, 200);
}

/**
 * Reset du score, même fonction qu'au dessus sauf qu'on met le score à 0
 */
function resetScore() {
    game.score = 0;
    // Dans 200ms, on animera et modifira la valeur graphique du score
    setTimeout(function () {
        document.getElementById("score").innerHTML = game.score;
        // Appel de la fonction animateCSS() sur l'élément id score pour faire l'animation bounceIn
        animateCSS("#score", "bounceIn");
    }, 200);
}

/**
 * Ajout d'un nouveau round à la partie, c'est le tour de simon
 */
function addRound() {
    // Tour de simon
    updatePlayerTurn(false);
    // Incrémentation des rounds dans l'objet game
    game.round++;
    // Dans 200ms, on animera et modifira la valeur graphique des rounds
    setTimeout(function () {
        document.getElementById("round").innerHTML = game.round;
        // Appel de la fonction animateCSS() sur l'élément id round pour faire l'animation bounceIn
        animateCSS("#round", "bounceIn");
    }, 200);

    // Génère les mouvements de simon
    generateMove();
}

/**
 * Fonction animateCSS donnée par la doc pour animer les éléments en CSS
 */
function animateCSS(element, animationName, callback) {
    const node = document.querySelector(element);
    node.classList.add("animated", animationName);

    function handleAnimationEnd() {
        node.classList.remove("animated", animationName);
        node.removeEventListener("animationend", handleAnimationEnd);

        if (typeof callback === "function") callback();
    }

    node.addEventListener("animationend", handleAnimationEnd);
}

/**
 * Permet de faire un effet d'éclaircissement
 */
function lighten(el) {
    el.classList.add("lighten");
}

/**
 * Permet de faire un effet d'éclaircissement su une case avec un temps donné
 */
function lightenTimeout(el, timeout) {
    lighten(el);
    document.querySelector("#" + el.id + " p").style.display = "block";
    setTimeout(function () {
        el.classList.remove("lighten");
        document.querySelector("#" + el.id + " p").style.display = "none";
    }, timeout);
}

// Modal //

// Récupère le modal des règles
let rulesModal = document.getElementById("rulesModal");

// Récupère le bouton qui ouvre le modal
let rulesBtn = document.getElementById("rules");

// Récupère la croix pour fermer le modal
let span = document.getElementsByClassName("close")[0];

// Quand on clique sur le bouton, on ouvre le modal
rulesBtn.onclick = function () {
    rulesModal.style.display = "block";
};

// Quand on clique sur la croix, on ferme le modal
span.onclick = function () {
    rulesModal.style.display = "none";
};

// On ferme également le modal quand on clique en dehors du modal
window.onclick = function (event) {
    if (event.target == rulesModal) {
        rulesModal.style.display = "none";
    }
};
