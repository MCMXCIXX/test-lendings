/**
 * Clouds Taking Shape ApS — Quiz engine (Site B)
 * Soft module UI (no A–D letter circles)
 */
(function () {
  "use strict";

  var KEY = "cts_tool_result_v2";

  var PROFILES = {
    contexte: {
      id: "contexte",
      name: "Chercheur de contexte",
      blurb: "Vous cartographiez la scène avant d'ouvrir le débat.",
      body: "Quand une info se présente comme un électrochoc national, vous freinez. Votre priorité : source, déroulé, cadre. Ce n'est pas de la lenteur — c'est votre façon de rester lucide pendant que le plateau s'emballe.",
      forces: ["Méthode sous tension", "Résistance au buzz incomplet", "Goût du croisement de sources"],
      tip: "Limitez-vous à trois sources pour croiser. Au-delà, la curiosité se dilue.",
    },
    formulation: {
      id: "formulation",
      name: "Vérificateur de formulation",
      blurb: "Vous pesez les mots avant d'avaler le récit.",
      body: "Une tournure trop absolue active votre filtre. Vous séparez ce qui est dit, ce qui est soufflé et ce qui est dramatisé. Votre super-pouvoir : rendre l'annonce mesurable.",
      forces: ["Précision linguistique", "Radar anti-hyperbole", "Lecture critique du ton"],
      tip: "Réécrivez la phrase sans adjectifs spectaculaires. Si elle tombe à plat, la formulation portait l'émotion.",
    },
    observateur: {
      id: "observateur",
      name: "Observateur calme",
      blurb: "Vous regardez la vague passer avant d'y plonger.",
      body: "Vous utilisez les réactions collectives comme baromètre. Ce recul vous protège de la contagion émotionnelle du direct. Vous parlez plus tard — souvent plus juste.",
      forces: ["Calme émotionnel", "Lecture des dynamiques", "Timing stratégique"],
      tip: "Lancez un minuteur de 15 minutes avant tout commentaire public sur une annonce explosive.",
    },
    acteur: {
      id: "acteur",
      name: "Acteur pratique",
      blurb: "Vous convertissez l'info en décision utile — ou vous zappez.",
      body: "Votre filtre est simple : ça change quelque chose pour moi ? Si non, vous économisez votre attention. Si oui, vous passez à l'action. L'utilité gagne toujours sur le spectacle.",
      forces: ["Efficacité", "Tri signal / bruit", "Orientation action"],
      tip: "Écrivez une micro-action de 5 minutes. Si rien ne vient, classez le sujet.",
    },
  };

  var QUESTIONS = [
    {
      text: "On annonce à l'antenne qu'une déclaration a « choqué toute la France ». Votre premier mouvement ?",
      options: [
        { profile: "contexte", label: "Je remonte à la source et au déroulé exact." },
        { profile: "formulation", label: "Je questionne l'expression « toute la France »." },
        { profile: "observateur", label: "Je regarde d'abord comment les autres réagissent." },
        { profile: "acteur", label: "Je me demande si cela impacte ma journée." },
      ],
    },
    {
      text: "On vous presse de réagir tout de suite. Vous…",
      options: [
        { profile: "contexte", label: "Demandez les faits bruts avant tout avis." },
        { profile: "formulation", label: "Signalez ce qui est affirmé sans preuve." },
        { profile: "observateur", label: "Préférez écouter encore un peu." },
        { profile: "acteur", label: "Répondez surtout via les conséquences utiles." },
      ],
    },
    {
      text: "Le plateau martèle : « Personne n'en revient. » Qu'est-ce qui vous accroche ?",
      options: [
        { profile: "contexte", label: "Le manque de détails concrets sur l'événement." },
        { profile: "formulation", label: "La généralisation totale (« personne »)." },
        { profile: "observateur", label: "La montée émotionnelle du studio." },
        { profile: "acteur", label: "Savoir s'il y a une suite pratique." },
      ],
    },
    {
      text: "Le lendemain, la même phrase revient partout. Vous…",
      options: [
        { profile: "contexte", label: "Comparez plusieurs médias pour croiser." },
        { profile: "formulation", label: "Vérifiez si le wording a évolué." },
        { profile: "observateur", label: "Mesurez si l'emballement retombe." },
        { profile: "acteur", label: "Décidez vite si le sujet mérite encore du temps." },
      ],
    },
    {
      text: "Pour vous, le meilleur usage d'une info « choc » est de…",
      options: [
        { profile: "contexte", label: "Remettre de l'ordre chronologique." },
        { profile: "formulation", label: "Clarifier ce que la phrase exagère." },
        { profile: "observateur", label: "Apaiser le climat autour de vous." },
        { profile: "acteur", label: "Proposer la prochaine étape concrète." },
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
        b.textContent = opt.label;
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
        "<h1 style=\"font-size:2rem\">Pas encore de résultat</h1>" +
        "<p>Lancez l'outil pour obtenir votre profil.</p>" +
        '<div class="actions"><a class="btn btn--blue" href="quiz.html">Démarrer</a></div>' +
        "</div>";
      return;
    }

    var forces = profile.forces
      .map(function (f) {
        return "<li>" + f + "</li>";
      })
      .join("");

    root.innerHTML =
      '<div class="result-hero">' +
      '<span class="tag">Votre profil</span>' +
      "<h1>" +
      profile.name +
      "</h1>" +
      "<p>" +
      profile.blurb +
      "</p>" +
      "</div>" +
      '<article class="panel">' +
      "<h2 style=\"font-size:1.5rem\">En pratique</h2>" +
      "<p>" +
      profile.body +
      "</p>" +
      '<div class="forces-box"><h3>Vos forces</h3><ul>' +
      forces +
      "</ul></div>" +
      '<div class="tip"><strong>Astuce utile</strong><p style="margin:0">' +
      profile.tip +
      "</p></div>" +
      '<p class="note"><strong>Important</strong> — Cet outil est proposé à titre purement ludique. Il ne s\'agit ni d\'un diagnostic, ni d\'une évaluation scientifique, ni d\'un conseil professionnel. Les profils sont des simplifications destinées au divertissement.</p>' +
      '<div class="actions">' +
      '<a class="btn btn--blue" href="quiz.html">Rejouer</a>' +
      '<a class="btn btn--ghost" href="index.html">Accueil</a>' +
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
  });
})();
