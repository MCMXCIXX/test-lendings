/**
 * Clouds Taking Shape ApS — Quiz engine (Site B)
 * A=contexte, B=formulation, C=observateur, D=acteur
 */
(function () {
  "use strict";

  var KEY = "cts_quiz_result_v1";

  var PROFILES = {
    contexte: {
      id: "contexte",
      name: "Chercheur de contexte",
      blurb: "Vous cartographiez d'abord la scène avant de prendre position.",
      body: "Dès qu'une info « choc » circule, vous voulez la chronologie, la source et le cadre. Ce n'est pas du doute pour le doute : c'est votre façon de consommer l'actualité avec méthode. Vous gagnez en clarté quand les autres s'emballent.",
      forces: ["Méthode sous pression", "Résilience face au buzz", "Goût du fact-checking"],
      tip: "Gardez trois onglets max pour croiser les versions — au-delà, la curiosité devient dispersion.",
    },
    formulation: {
      id: "formulation",
      name: "Vérificateur de formulation",
      blurb: "Vous décortiquez les mots et l'ampleur de ce qui est affirmé.",
      body: "Une tournure trop absolue (« toute la France », « personne n'en revient ») active votre radar. Vous séparez ce qui est dit, ce qui est sous-entendu et ce qui est dramatisé. Votre force : rendre l'annonce mesurable.",
      forces: ["Précision linguistique", "Sens des hyperboles", "Lecture critique du ton"],
      tip: "Réécrivez la phrase sans adjectifs spectaculaires. Si elle s'affaiblit, la formulation portait l'émotion.",
    },
    observateur: {
      id: "observateur",
      name: "Observateur calme",
      blurb: "Vous laissez le bruit retomber avant de vous engager.",
      body: "Vous observez les réactions collectives comme un baromètre. Ce recul vous protège de la contagion émotionnelle du direct. Vous intervenez plus tard… mais souvent plus juste.",
      forces: ["Calme émotionnel", "Lecture des dynamiques", "Patience stratégique"],
      tip: "Activez un minuteur de 20 minutes avant tout commentaire public sur une annonce explosive.",
    },
    acteur: {
      id: "acteur",
      name: "Acteur pratique",
      blurb: "Vous transformez l'info en décision utile — ou vous passez.",
      body: "Vous filtrez vite : cette déclaration change-t-elle quelque chose pour vous ? Si non, vous économisez votre attention. Si oui, vous agissez. Votre boussole, c'est l'utilité concrète.",
      forces: ["Efficacité", "Tri signal / bruit", "Orientation action"],
      tip: "Écrivez une action de 5 minutes max. Si vous n'en trouvez aucune, classez le sujet.",
    },
  };

  var QUESTIONS = [
    {
      text: "Une annonce retentit et on dit qu'elle a « choqué toute la France ». Votre premier mouvement ?",
      options: [
        { key: "A", profile: "contexte", label: "Je remonte à la source et au déroulé exact." },
        { key: "B", profile: "formulation", label: "Je questionne l'expression « toute la France »." },
        { key: "C", profile: "observateur", label: "Je regarde d'abord comment les autres réagissent." },
        { key: "D", profile: "acteur", label: "Je me demande si cela impacte ma journée." },
      ],
    },
    {
      text: "On vous presse de « réagir tout de suite » à une déclaration choc. Vous…",
      options: [
        { key: "A", profile: "contexte", label: "Demandez les faits bruts avant tout avis." },
        { key: "B", profile: "formulation", label: "Signalez ce qui est affirmé sans preuve." },
        { key: "C", profile: "observateur", label: "Préférez écouter encore un peu." },
        { key: "D", profile: "acteur", label: "Répondez surtout via les conséquences utiles." },
      ],
    },
    {
      text: "Le plateau martèle : « Personne n'en revient. » Qu'est-ce qui vous accroche ?",
      options: [
        { key: "A", profile: "contexte", label: "Le manque de détails concrets sur l'événement." },
        { key: "B", profile: "formulation", label: "La généralisation totale (« personne »)." },
        { key: "C", profile: "observateur", label: "La montée émotionnelle du studio." },
        { key: "D", profile: "acteur", label: "Savoir s'il y a une suite pratique." },
      ],
    },
    {
      text: "Le lendemain, la même phrase choc revient partout. Vous…",
      options: [
        { key: "A", profile: "contexte", label: "Comparez plusieurs médias pour croiser." },
        { key: "B", profile: "formulation", label: "Vérifiez si le wording a évolué." },
        { key: "C", profile: "observateur", label: "Mesurez si l'emballement retombe." },
        { key: "D", profile: "acteur", label: "Décidez vite si le sujet mérite encore du temps." },
      ],
    },
    {
      text: "Pour vous, le meilleur usage d'une info « choc » est de…",
      options: [
        { key: "A", profile: "contexte", label: "Remettre de l'ordre chronologique." },
        { key: "B", profile: "formulation", label: "Clarifier ce que la phrase exagère." },
        { key: "C", profile: "observateur", label: "Apaiser le climat autour de vous." },
        { key: "D", profile: "acteur", label: "Proposer la prochaine étape concrète." },
      ],
    },
  ];

  function score(answers) {
    var t = { contexte: 0, formulation: 0, observateur: 0, acteur: 0 };
    answers.forEach(function (id) {
      if (t[id] !== undefined) t[id] += 1;
    });
    var order = ["contexte", "formulation", "observateur", "acteur"];
    var winner = order[0];
    var max = -1;
    order.forEach(function (id) {
      if (t[id] > max) {
        max = t[id];
        winner = id;
      }
    });
    return { winner: winner, tallies: t };
  }

  function save(id) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ profileId: id, at: Date.now() }));
    } catch (e) {}
  }

  function load() {
    try {
      var raw = sessionStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function $(id) {
    return document.getElementById(id);
  }

  function runQuiz() {
    if (!$("quiz-app")) return;
    var state = { i: 0, answers: [] };
    var bar = $("bar");
    var label = $("prog-label");
    var pct = $("prog-pct");
    var qEl = $("q-text");
    var aEl = $("answers");
    var track = $("prog-track");

    function progress() {
      var total = QUESTIONS.length;
      var p = Math.round((state.i / total) * 100);
      if (bar) bar.style.width = p + "%";
      if (label) label.textContent = "Question " + (state.i + 1) + " / " + total;
      if (pct) pct.textContent = p + " %";
      if (track) track.setAttribute("aria-valuenow", String(p));
    }

    function paint() {
      var q = QUESTIONS[state.i];
      progress();
      qEl.classList.remove("q-title");
      void qEl.offsetWidth;
      qEl.classList.add("q-title");
      qEl.textContent = q.text;
      aEl.innerHTML = "";
      q.options.forEach(function (opt) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "answer";
        b.innerHTML =
          '<span class="answer__key" aria-hidden="true">' +
          opt.key +
          "</span><span>" +
          opt.label +
          "</span>";
        b.addEventListener("click", function () {
          state.answers.push(opt.profile);
          state.i += 1;
          if (state.i >= QUESTIONS.length) {
            if (bar) bar.style.width = "100%";
            if (pct) pct.textContent = "100 %";
            save(score(state.answers).winner);
            window.location.href = "resultat.html";
          } else {
            paint();
          }
        });
        aEl.appendChild(b);
      });
    }

    paint();
  }

  function runResult() {
    var root = $("result-app");
    if (!root) return;
    var stored = load();
    var id = stored && stored.profileId;
    var profile = id && PROFILES[id] ? PROFILES[id] : null;

    if (!profile) {
      root.innerHTML =
        '<div class="panel">' +
        "<h1>Pas encore de résultat</h1>" +
        "<p>Lancez le quiz pour obtenir votre archétype.</p>" +
        '<div class="actions"><a class="btn btn--coral" href="quiz.html">Démarrer le quiz</a></div>' +
        "</div>";
      return;
    }

    var forces = profile.forces
      .map(function (f) {
        return "<li>" + f + "</li>";
      })
      .join("");

    root.innerHTML =
      '<div class="result-banner">' +
      '<span class="result-banner__tag">Votre archétype</span>' +
      "<h1>" +
      profile.name +
      "</h1>" +
      "<p>" +
      profile.blurb +
      "</p>" +
      "</div>" +
      '<article class="panel">' +
      "<h2>En pratique</h2>" +
      "<p>" +
      profile.body +
      "</p>" +
      '<div class="strength-box"><h3>Vos forces</h3><ul>' +
      forces +
      "</ul></div>" +
      '<div class="tip"><strong>Astuce utile</strong><p style="margin:0">' +
      profile.tip +
      "</p></div>" +
      '<p class="note"><strong style="color:var(--ink-soft)">Important</strong> — Ce quiz est proposé à titre purement ludique. Il ne s\'agit ni d\'un diagnostic, ni d\'une évaluation scientifique, ni d\'un conseil professionnel. Les archétypes sont des simplifications destinées au divertissement.</p>' +
      '<div class="actions">' +
      '<a class="btn btn--coral" href="quiz.html">Rejouer</a>' +
      '<a class="btn btn--outline-coral" href="index.html">Accueil</a>' +
      "</div>" +
      "</article>";
  }

  window.CTSQuiz = {
    PROFILES: PROFILES,
    QUESTIONS: QUESTIONS,
    score: score,
  };

  document.addEventListener("DOMContentLoaded", function () {
    runQuiz();
    runResult();
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = String(new Date().getFullYear());
  });
})();
