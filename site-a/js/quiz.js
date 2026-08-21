/**
 * Bondeskovgaard Cleaning ApS — Quiz engine (Site A)
 * Keys: chercheur / verificateur / observateur / acteur
 * UI uses numeric indices 01–04 (not A–D letter circles)
 */
(function () {
  "use strict";

  var STORAGE_KEY = "bc_lab_result_v2";

  var PROFILES = {
    chercheur: {
      id: "chercheur",
      name: "Chercheur de contexte",
      short:
        "Vous reconstruez la scène avant d'accepter le récit du plateau.",
      description:
        "Dès qu'une déclaration présentée comme choquante traverse l'antenne, vous suspendez l'émotion. Votre priorité : retrouver l'extrait, l'horaire, les interlocuteurs, le cadre. Ce n'est pas de la froideur — c'est une méthode pour ne pas confondre intensité médiatique et réalité établie.",
      strengths: [
        "Discipline face à l'urgence du direct",
        "Goût pour les chronologies complètes",
        "Capacité à séparer bruit et matière factuelle",
      ],
      tip: "Notez trois faits vérifiés et une inconnue. Partagez uniquement les faits — gardez l'inconnue hors du fil.",
    },
    verificateur: {
      id: "verificateur",
      name: "Vérificateur de formulation",
      short:
        "Vous entendez d'abord la rhétorique : ampleur, certitude, angles morts.",
      description:
        "Les formules absolues (« toute la France », « personne n'en revient ») déclenchent votre alerte. Vous lisez la déclaration comme un texte : ce qui est affirmé, ce qui est suggéré, ce qui est dramatisé. Votre force est de rendre l'annonce mesurable avant d'y réagir.",
      strengths: [
        "Sens aigu des hyperboles du plateau",
        "Lecture fine du ton et des sous-entendus",
        "Réflexe de reformulation avant adhésion",
      ],
      tip: "Réécrivez la phrase sans superlatif. Si elle s'effondre, c'est la formulation — pas le fond — qui portait le choc.",
    },
    observateur: {
      id: "observateur",
      name: "Observateur calme",
      short:
        "Vous laissez le tumulte retomber avant de fixer votre lecture.",
      description:
        "Quand on dit qu'une info a choqué toute la France, vous regardez d'abord comment l'onde se propage. Ce recul n'est pas de l'indifférence : c'est une stratégie pour éviter la contagion émotionnelle du direct. Vous intervenez plus tard, souvent plus juste.",
      strengths: [
        "Distance utile en période de surchauffe",
        "Lecture des dynamiques collectives",
        "Patience face à la surenchère d'opinions",
      ],
      tip: "Fixez un délai court (vingt minutes) avant tout commentaire public sur une annonce explosive.",
    },
    acteur: {
      id: "acteur",
      name: "Acteur pratique",
      short:
        "Vous traduisez l'annonce en impact concret — ou vous passez.",
      description:
        "Une phrase choc à l'antenne ne reste pas abstraite pour vous. Vous demandez vite : cela change-t-il une décision, un trajet, une conversation ? Si non, vous économisez votre attention. Votre boussole, c'est l'utilité réelle, pas le spectacle.",
      strengths: [
        "Tri rapide signal / distraction",
        "Orientation action sous pression info",
        "Économie d'énergie cognitive",
      ],
      tip: "Posez la question : « Qu'est-ce que je modifie demain ? » Si la réponse est « rien », classez le sujet.",
    },
  };

  var QUESTIONS = [
    {
      text: "À l'antenne, on martèle que la déclaration d'hier soir a choqué toute la France. Votre tout premier geste…",
      options: [
        { idx: "01", profile: "chercheur", label: "Retrouver l'extrait original et son contexte." },
        { idx: "02", profile: "verificateur", label: "Interroger la portée de « toute la France »." },
        { idx: "03", profile: "observateur", label: "Observer comment l'onde se propage autour de vous." },
        { idx: "04", profile: "acteur", label: "Vérifier si cela change quelque chose pour vous aujourd'hui." },
      ],
    },
    {
      text: "On vous demande immédiatement votre avis sur cette déclaration choc. Vous…",
      options: [
        { idx: "01", profile: "chercheur", label: "Reportez le jugement tant que les faits manquent." },
        { idx: "02", profile: "verificateur", label: "Repérez ce qui est affirmé sans preuve dans la phrase." },
        { idx: "03", profile: "observateur", label: "Préférez écouter avant de prendre position." },
        { idx: "04", profile: "acteur", label: "Répondez surtout sous l'angle des conséquences concrètes." },
      ],
    },
    {
      text: "Le présentateur lance : « Personne n'en revient. » Qu'est-ce qui vous accroche le plus ?",
      options: [
        { idx: "01", profile: "chercheur", label: "Le manque d'éléments sur ce qui s'est réellement passé." },
        { idx: "02", profile: "verificateur", label: "La généralisation absolue (« personne »)." },
        { idx: "03", profile: "observateur", label: "La pression émotionnelle du plateau en direct." },
        { idx: "04", profile: "acteur", label: "Savoir si une décision pratique en découle." },
      ],
    },
    {
      text: "Le lendemain, la même phrase circule encore. Votre réflexe…",
      options: [
        { idx: "01", profile: "chercheur", label: "Croiser plusieurs versions pour stabiliser le récit." },
        { idx: "02", profile: "verificateur", label: "Voir si la formulation a été adoucie ou amplifiée." },
        { idx: "03", profile: "observateur", label: "Mesurer si l'emballement a déjà baissé." },
        { idx: "04", profile: "acteur", label: "Décider vite si le sujet mérite encore votre attention." },
      ],
    },
    {
      text: "Face à une info censée avoir « choqué toute la France », vous vous sentez le plus utile quand vous…",
      options: [
        { idx: "01", profile: "chercheur", label: "Remettez de l'ordre chronologique et factuel." },
        { idx: "02", profile: "verificateur", label: "Démontez les tournures qui forcent l'émotion." },
        { idx: "03", profile: "observateur", label: "Apaisez le débat autour de vous." },
        { idx: "04", profile: "acteur", label: "Proposez la prochaine étape tangible." },
      ],
    },
  ];

  function scoreAnswers(answers) {
    var tallies = {
      chercheur: 0,
      verificateur: 0,
      observateur: 0,
      acteur: 0,
    };

    answers.forEach(function (profileId) {
      if (tallies[profileId] !== undefined) {
        tallies[profileId] += 1;
      }
    });

    var order = ["chercheur", "verificateur", "observateur", "acteur"];
    var winner = order[0];
    var max = -1;

    order.forEach(function (id) {
      if (tallies[id] > max) {
        max = tallies[id];
        winner = id;
      }
    });

    return { winner: winner, tallies: tallies };
  }

  function saveResult(profileId) {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ profileId: profileId, at: Date.now() })
      );
    } catch (e) {
      /* ignore */
    }
  }

  function loadResult() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function el(id) {
    return document.getElementById(id);
  }

  function renderQuiz() {
    var root = el("quiz-root");
    if (!root) return;

    var state = { index: 0, answers: [] };
    var progressBar = el("quiz-progress-bar");
    var progressLabel = el("quiz-progress-label");
    var progressPct = el("quiz-progress-pct");
    var questionEl = el("quiz-question");
    var optionsEl = el("quiz-options");

    function updateProgress() {
      var total = QUESTIONS.length;
      var current = state.index + 1;
      var pct = Math.round((state.index / total) * 100);
      if (progressBar) progressBar.style.width = pct + "%";
      if (progressLabel) {
        progressLabel.textContent = "Étape " + current + " / " + total;
      }
      if (progressPct) progressPct.textContent = pct + " %";
    }

    function finish() {
      var result = scoreAnswers(state.answers);
      saveResult(result.winner);
      if (progressBar) progressBar.style.width = "100%";
      if (progressPct) progressPct.textContent = "100 %";
      window.location.href = "resultat.html";
    }

    function choose(profileId) {
      state.answers.push(profileId);
      state.index += 1;
      if (state.index >= QUESTIONS.length) {
        finish();
      } else {
        paint();
      }
    }

    function paint() {
      var q = QUESTIONS[state.index];
      updateProgress();

      questionEl.classList.remove("quiz-q");
      void questionEl.offsetWidth;
      questionEl.classList.add("quiz-q");
      questionEl.textContent = q.text;

      optionsEl.innerHTML = "";
      q.options.forEach(function (opt) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-opt";
        btn.setAttribute("data-profile", opt.profile);
        btn.innerHTML =
          '<span class="quiz-opt__idx" aria-hidden="true">' +
          opt.idx +
          "</span><span>" +
          opt.label +
          "</span>";
        btn.addEventListener("click", function () {
          choose(opt.profile);
        });
        optionsEl.appendChild(btn);
      });
    }

    paint();
  }

  function renderResult() {
    var root = el("result-root");
    if (!root) return;

    var stored = loadResult();
    var profileId = stored && stored.profileId ? stored.profileId : null;
    var profile = profileId && PROFILES[profileId] ? PROFILES[profileId] : null;

    if (!profile) {
      root.innerHTML =
        '<div class="panel result-sheet">' +
        "<h1>Fiche indisponible</h1>" +
        "<p class=\"lede\">Aucun parcours n'a été détecté sur cet appareil. Relancez les cinq étapes pour générer votre lecture.</p>" +
        '<p class="result-actions"><a class="btn btn--teal" href="quiz.html">Ouvrir le parcours</a></p>' +
        "</div>";
      return;
    }

    var forces = profile.strengths
      .map(function (s) {
        return "<li>" + s + "</li>";
      })
      .join("");

    root.innerHTML =
      '<div class="panel result-sheet">' +
      '<p class="result-kicker">Lecture dominante</p>' +
      "<h1>" +
      profile.name +
      "</h1>" +
      '<p class="lede">' +
      profile.short +
      "</p>" +
      "<h2>Ce que le parcours révèle</h2>" +
      "<p>" +
      profile.description +
      "</p>" +
      "<h3>Forces observées</h3>" +
      '<ul class="forces">' +
      forces +
      "</ul>" +
      '<div class="tip"><strong>Piste pour la prochaine onde</strong><p style="margin:0">' +
      profile.tip +
      "</p></div>" +
      '<p class="disclaimer"><strong>Avertissement ludique</strong> — Ce résultat est proposé à titre purement récréatif. Il ne constitue ni un diagnostic psychologique, ni un conseil professionnel, ni une évaluation scientifique. Les profils sont des archétypes simplifiés destinés au divertissement.</p>' +
      '<p class="result-actions">' +
      '<a class="btn btn--teal" href="quiz.html">Refaire le parcours</a>' +
      '<a class="btn btn--ghost" href="index.html">Retour à l\'accueil</a>' +
      "</p>" +
      "</div>";
  }

  window.BondeskovgaardQuiz = {
    PROFILES: PROFILES,
    QUESTIONS: QUESTIONS,
    scoreAnswers: scoreAnswers,
    saveResult: saveResult,
    loadResult: loadResult,
    renderQuiz: renderQuiz,
    renderResult: renderResult,
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (el("quiz-root")) renderQuiz();
    if (el("result-root")) renderResult();
  });
})();
