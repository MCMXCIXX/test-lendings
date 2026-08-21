/**
 * Site B — Utility quiz (lime / white)
 */
(function () {
  "use strict";
  var KEY = "cts_lime_v3";

  var PROFILES = {
    contexte: {
      name: "Chercheur de contexte",
      blurb: "Vous cartographiez d'abord la scène.",
      body: "Dès qu'une info « choc » circule à l'antenne, vous voulez la chronologie et la source. Ce n'est pas du doute pour le doute : c'est votre façon de consommer l'actualité avec méthode.",
      forces: ["Méthode sous buzz", "Résilience face au flux", "Goût du fact-checking"],
      tip: "Trois sources max pour croiser — au-delà, la curiosité devient dispersion.",
    },
    formulation: {
      name: "Vérificateur de formulation",
      blurb: "Vous décortiquez les mots et l'ampleur.",
      body: "Une tournure trop absolue (« toute la France ») active votre radar. Vous séparez dit, sous-entendu et dramatisé. Votre force : rendre l'annonce mesurable.",
      forces: ["Précision linguistique", "Sens des hyperboles", "Lecture critique du ton"],
      tip: "Réécrivez la phrase sans adjectifs spectaculaires. Si elle s'affaiblit, la formulation portait l'émotion.",
    },
    observateur: {
      name: "Observateur calme",
      blurb: "Vous laissez le bruit retomber avant d'agir.",
      body: "Vous observez les réactions collectives comme un baromètre. Ce recul vous protège de la contagion émotionnelle du direct.",
      forces: ["Calme émotionnel", "Lecture des dynamiques", "Patience stratégique"],
      tip: "Minuteur de 20 minutes avant tout commentaire public sur une annonce explosive.",
    },
    acteur: {
      name: "Acteur pratique",
      blurb: "Vous transformez l'info en décision utile — ou vous passez.",
      body: "Vous filtrez vite : cette déclaration change-t-elle quelque chose pour vous ? Sinon, vous économisez votre attention.",
      forces: ["Efficacité", "Tri signal / bruit", "Orientation action"],
      tip: "Écrivez une action de 5 minutes. Si vous n'en trouvez aucune, classez le sujet.",
    },
  };

  var QUESTIONS = [
    {
      text: "On annonce qu'une déclaration a « choqué toute la France » à l'antenne. Premier réflexe ?",
      options: [
        { k: "A", p: "contexte", t: "Je remonte à la source et au déroulé." },
        { k: "B", p: "formulation", t: "Je questionne « toute la France »." },
        { k: "C", p: "observateur", t: "Je regarde d'abord les réactions." },
        { k: "D", p: "acteur", t: "Je checke l'impact sur ma journée." },
      ],
    },
    {
      text: "On vous presse de réagir à la déclaration choc. Vous…",
      options: [
        { k: "A", p: "contexte", t: "Demandez les faits bruts." },
        { k: "B", p: "formulation", t: "Signalez ce qui manque de preuve." },
        { k: "C", p: "observateur", t: "Écoutez encore un peu." },
        { k: "D", p: "acteur", t: "Parlez surtout des suites utiles." },
      ],
    },
    {
      text: "« Personne n'en revient » — qu'est-ce qui vous marque ?",
      options: [
        { k: "A", p: "contexte", t: "Le manque de détails concrets." },
        { k: "B", p: "formulation", t: "La généralisation totale." },
        { k: "C", p: "observateur", t: "La montée émotionnelle du plateau." },
        { k: "D", p: "acteur", t: "Savoir s'il y a une suite pratique." },
      ],
    },
    {
      text: "Le lendemain, la même phrase choc revient partout. Vous…",
      options: [
        { k: "A", p: "contexte", t: "Comparez plusieurs médias." },
        { k: "B", p: "formulation", t: "Vérifiez si le wording a bougé." },
        { k: "C", p: "observateur", t: "Mesurez si l'emballement retombe." },
        { k: "D", p: "acteur", t: "Décidez si ça mérite encore du temps." },
      ],
    },
    {
      text: "Le meilleur usage d'une info qui a choqué la France, pour vous ?",
      options: [
        { k: "A", p: "contexte", t: "Remettre de l'ordre chronologique." },
        { k: "B", p: "formulation", t: "Clarifier ce que la phrase exagère." },
        { k: "C", p: "observateur", t: "Apaiser le climat autour de vous." },
        { k: "D", p: "acteur", t: "Proposer la prochaine étape concrète." },
      ],
    },
  ];

  function score(ans) {
    var t = { contexte: 0, formulation: 0, observateur: 0, acteur: 0 };
    ans.forEach(function (id) { if (t[id] !== undefined) t[id]++; });
    var order = ["contexte", "formulation", "observateur", "acteur"];
    var w = order[0], m = -1;
    order.forEach(function (id) { if (t[id] > m) { m = t[id]; w = id; } });
    return w;
  }

  function save(id) {
    try { sessionStorage.setItem(KEY, JSON.stringify({ id: id })); } catch (e) {}
  }
  function load() {
    try { var r = sessionStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; }
  }
  function $(id) { return document.getElementById(id); }

  function runQuiz() {
    if (!$("quiz-app")) return;
    var state = { i: 0, answers: [] };
    var qEl = $("q");
    var ans = $("ans");
    var dots = $("dots");
    var label = $("lab");

    function paintDots() {
      if (!dots) return;
      dots.innerHTML = "";
      for (var n = 0; n < QUESTIONS.length; n++) {
        var d = document.createElement("span");
        d.className = "dot" + (n < state.i ? " is-done" : n === state.i ? " is-on" : "");
        dots.appendChild(d);
      }
    }

    function paint() {
      var q = QUESTIONS[state.i];
      paintDots();
      if (label) label.textContent = (state.i + 1) + " / " + QUESTIONS.length;
      qEl.classList.remove("q");
      void qEl.offsetWidth;
      qEl.classList.add("q");
      qEl.textContent = q.text;
      ans.innerHTML = "";
      q.options.forEach(function (o) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "ans";
        b.innerHTML = '<span class="ans__k">' + o.k + "</span><span>" + o.t + "</span>";
        b.addEventListener("click", function () {
          state.answers.push(o.p);
          state.i++;
          if (state.i >= QUESTIONS.length) {
            save(score(state.answers));
            location.href = "resultat.html";
          } else paint();
        });
        ans.appendChild(b);
      });
    }
    paint();
  }

  function runResult() {
    var root = $("result-app");
    if (!root) return;
    var s = load();
    var p = s && PROFILES[s.id] ? PROFILES[s.id] : null;
    if (!p) {
      root.innerHTML = '<div class="panel"><h1>Pas encore de résultat</h1><p>Lancez le quiz pour obtenir votre archétype.</p><div class="actions"><a class="btn btn--lime" href="quiz.html">Commencer le quiz</a></div></div>';
      return;
    }
    var forces = p.forces.map(function (f) { return "<li>" + f + "</li>"; }).join("");
    root.innerHTML =
      '<div style="text-align:center;margin-bottom:1.5rem"><span class="result-tag">Votre archétype</span><h1>' +
      p.name +
      "</h1><p>" +
      p.blurb +
      '</p></div><article class="panel"><h2>En pratique</h2><p>' +
      p.body +
      '</p><h3>Vos forces</h3><ul class="force-list">' +
      forces +
      '</ul><div class="tip"><strong>Astuce utile</strong><p style="margin:0;color:var(--ink);font-weight:600">' +
      p.tip +
      '</p></div><p class="note"><strong style="color:var(--ink)">Avertissement</strong> — Quiz purement ludique. Pas de diagnostic, pas de conseil professionnel.</p><div class="actions"><a class="btn btn--lime" href="quiz.html">Rejouer</a><a class="btn btn--ghost" href="index.html">Accueil</a></div></article>';
  }

  document.addEventListener("DOMContentLoaded", function () {
    runQuiz();
    runResult();
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = String(new Date().getFullYear());
  });
})();
