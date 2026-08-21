/**
 * Bondeskovgaard Cleaning ApS — Quiz engine (Site A)
 * Answers: A=chercheur, B=verificateur, C=observateur, D=acteur
 */
(function () {
  "use strict";

  var STORAGE_KEY = "bc_quiz_result_v1";

  var PROFILES = {
    chercheur: {
      id: "chercheur",
      name: "Chercheur de contexte",
      short:
        "Face à une déclaration choc, vous suspendez le jugement et reconstituez d'abord la scène.",
      description:
        "Quand une phrase retentit à l'antenne et prétend avoir choqué toute la France, votre premier réflexe n'est pas l'indignation : c'est la vérification. Vous cherchez le clip original, le moment exact, les faits manquants. Ce besoin de cadre révèle une vigilance cognitive rare.",
      strengths: [
        "Curiosité méthodique face à l'urgence médiatique",
        "Résistance aux conclusions précipitées",
        "Capacité à distinguer le récit du fait",
      ],
      tip: "Avant de partager, notez en une phrase ce que vous savez vraiment — et ce qui reste une hypothèse.",
    },
    verificateur: {
      id: "verificateur",
      name: "Vérificateur de formulation",
      short:
        "Vous entendez d'abord les mots : ampleur, certitude, généralisations cachées.",
      description:
        "Une déclaration censée choquer toute la France vous met en alerte linguistique. « Toute la France », « hier soir », « à l'antenne » : vous mesurez la portée des affirmations avant d'adhérer. Votre profil lit la rhétorique comme un signal, pas comme une vérité.",
      strengths: [
        "Précision face aux formules spectaculaires",
        "Sensibilité aux hyperboles et aux angles morts",
        "Jugement nuancé sur ce qui est affirmé vs suggéré",
      ],
      tip: "Reformulez l'annonce sans superlatifs. Si le sens s'effondre, la formulation faisait le travail émotionnel.",
    },
    observateur: {
      id: "observateur",
      name: "Observateur calme",
      short:
        "Vous laissez d'abord le tumulte retomber avant de former votre lecture.",
      description:
        "Lorsque quelque chose « a choqué toute la France » selon les plateaux, vous regardez les réactions avant d'y participer. Ce détachement n'est pas de l'indifférence : c'est une stratégie pour ne pas être emporté par la contagion émotionnelle du direct.",
      strengths: [
        "Distance émotionnelle utile en période de bruit",
        "Lecture fine des dynamiques collectives",
        "Patience face à la surenchère d'opinions",
      ],
      tip: "Fixez-vous un délai court (par ex. 30 minutes) avant tout commentaire public sur une annonce choc.",
    },
    acteur: {
      id: "acteur",
      name: "Acteur pratique",
      short:
        "Vous traduisez immédiatement l'annonce en impact concret sur votre journée.",
      description:
        "Une déclaration choc à l'antenne ne reste pas abstraite pour vous : vous évaluez vite si elle change une décision, un déplacement, une conversation. Votre énergie va vers l'utile. Le spectacle médiatique compte moins que la conséquence réelle.",
      strengths: [
        "Orientation action sous pression informationnelle",
        "Tri rapide entre signal et distraction",
        "Efficacité décisionnelle sans sur-analyser",
      ],
      tip: "Posez la question : « Qu'est-ce que je change concrètement demain ? » Si la réponse est « rien », rangez l'alerte.",
    },
  };

  var QUESTIONS = [
    {
      text: "Vous entendez à l'antenne : « Ce qui s'est passé hier soir a choqué toute la France. » Votre tout premier pas…",
      options: [
        { key: "A", profile: "chercheur", label: "Retrouver le passage original et le contexte exact." },
        { key: "B", profile: "verificateur", label: "Interroger l'ampleur de « toute la France »." },
        { key: "C", profile: "observateur", label: "Observer comment l'entourage et les réseaux réagissent." },
        { key: "D", profile: "acteur", label: "Vérifier si cela change quelque chose pour vous aujourd'hui." },
      ],
    },
    {
      text: "Une déclaration choc circule en boucle. On vous demande votre avis immédiatement. Vous…",
      options: [
        { key: "A", profile: "chercheur", label: "Dites que vous voulez d'abord les faits bruts." },
        { key: "B", profile: "verificateur", label: "Relevez ce qui est affirmé sans preuve dans la phrase." },
        { key: "C", profile: "observateur", label: "Préférez écouter avant de prendre position." },
        { key: "D", profile: "acteur", label: "Répondez surtout sous l'angle des conséquences pratiques." },
      ],
    },
    {
      text: "Le présentateur insiste : « Personne n'en revient. » Qu'est-ce qui vous marque le plus ?",
      options: [
        { key: "A", profile: "chercheur", label: "L'absence d'éléments concrets sur ce qui s'est passé." },
        { key: "B", profile: "verificateur", label: "La généralisation absolue (« personne »)." },
        { key: "C", profile: "observateur", label: "La pression émotionnelle du plateau en direct." },
        { key: "D", profile: "acteur", label: "Savoir si une action ou une décision en découle." },
      ],
    },
    {
      text: "Vous croisez la même phrase choc le lendemain matin. Votre réflexe…",
      options: [
        { key: "A", profile: "chercheur", label: "Comparer plusieurs sources pour croiser les versions." },
        { key: "B", profile: "verificateur", label: "Voir si la formulation a été adoucie ou amplifiée." },
        { key: "C", profile: "observateur", label: "Mesurer si l'emballement a déjà baissé." },
        { key: "D", profile: "acteur", label: "Décider vite si le sujet mérite encore votre attention." },
      ],
    },
    {
      text: "Face à une info censée avoir « choqué toute la France », vous vous sentez le plus utile lorsque vous…",
      options: [
        { key: "A", profile: "chercheur", label: "Remettez de l'ordre chronologique et factuel." },
        { key: "B", profile: "verificateur", label: "Démontez les tournures trompeuses." },
        { key: "C", profile: "observateur", label: "Calmez le débat autour de vous." },
        { key: "D", profile: "acteur", label: "Proposez la prochaine étape concrète." },
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

    var state = {
      index: 0,
      answers: [],
    };

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
      if (progressLabel) progressLabel.textContent = "Question " + current + " / " + total;
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

      questionEl.classList.remove("quiz-question");
      void questionEl.offsetWidth;
      questionEl.classList.add("quiz-question");
      questionEl.textContent = q.text;

      optionsEl.innerHTML = "";
      q.options.forEach(function (opt) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-option";
        btn.setAttribute("data-profile", opt.profile);
        btn.innerHTML =
          '<span class="quiz-option__letter" aria-hidden="true">' +
          opt.key +
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
        '<div class="card">' +
        "<h1>Résultat indisponible</h1>" +
        "<p>Aucun parcours de quiz n'a été détecté. Reprenez les cinq questions pour découvrir votre profil.</p>" +
        '<p style="margin-top:1.5rem"><a class="btn btn--primary" href="quiz.html">Lancer le quiz</a></p>' +
        "</div>";
      return;
    }

    var forces = profile.strengths
      .map(function (s) {
        return "<li>" + s + "</li>";
      })
      .join("");

    root.innerHTML =
      '<div class="result-hero is-revealed">' +
      '<p class="result-kicker">Votre profil</p>' +
      "<h1>" +
      profile.name +
      "</h1>" +
      "<p>" +
      profile.short +
      "</p>" +
      "</div>" +
      '<article class="card is-revealed" style="animation-delay:0.08s">' +
      "<h2>Ce que cela révèle</h2>" +
      "<p>" +
      profile.description +
      "</p>" +
      '<h3 class="accent" style="margin-top:1.5rem">Vos forces</h3>' +
      '<ul class="forces-list">' +
      forces +
      "</ul>" +
      '<div class="tip-box"><strong>Piste concrète</strong><p style="margin:0;color:var(--text-muted)">' +
      profile.tip +
      "</p></div>" +
      '<p class="disclaimer"><strong style="color:var(--text-muted)">Avertissement</strong> — Ce quiz est proposé à titre purement ludique et récréatif. Il ne constitue ni un diagnostic psychologique, ni un conseil professionnel, ni une évaluation scientifique. Les profils sont des archétypes simplifiés destinés au divertissement.</p>' +
      '<p style="margin-top:1.75rem;display:flex;flex-wrap:wrap;gap:0.75rem">' +
      '<a class="btn btn--primary" href="quiz.html">Refaire le parcours</a>' +
      '<a class="btn btn--ghost" href="index.html">Retour à l\'accueil</a>' +
      "</p>" +
      "</article>";
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
