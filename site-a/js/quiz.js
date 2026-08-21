/**
 * Site A — Broadsheet quiz engine
 * Answers map: 1=chercheur, 2=verificateur, 3=observateur, 4=acteur
 */
(function () {
  "use strict";
  var KEY = "bg_broadsheet_v3";

  var PROFILES = {
    chercheur: {
      name: "Chercheur de contexte",
      blurb: "Vous reconstituez la scène avant de prendre position.",
      body: "Face à une déclaration présentée comme un choc national, votre premier mouvement n'est pas l'indignation : c'est la reconstitution. Extrait, horaire, interlocuteurs, cadre. Vous refusez de confondre intensité du plateau et faits établis.",
      forces: [
        "Méthode sous pression médiatique",
        "Résistance aux conclusions express",
        "Distinction nette entre récit et preuve",
      ],
      tip: "Notez en une ligne ce que vous savez vraiment — et ce qui reste une hypothèse — avant de partager.",
    },
    verificateur: {
      name: "Vérificateur de formulation",
      blurb: "Vous mesurez d'abord les mots et l'ampleur de l'affirmation.",
      body: "« Toute la France », « personne n'en revient », « déclaration choc » : votre oreille se fixe sur la rhétorique. Vous séparez ce qui est dit, ce qui est suggéré et ce qui est dramatisé. Votre boussole, c'est la précision du langage.",
      forces: [
        "Lecture fine des hyperboles",
        "Sensibilité aux généralisations",
        "Jugement nuancé sur le ton du direct",
      ],
      tip: "Réécrivez la phrase sans superlatifs. Si le sens s'effondre, la formulation portait l'émotion.",
    },
    observateur: {
      name: "Observateur calme",
      blurb: "Vous laissez l'onde émotionnelle passer avant de trancher.",
      body: "Quand on annonce qu'une info a choqué toute la France, vous regardez d'abord comment la salle, le fil et l'entourage réagissent. Ce n'est pas de l'indifférence : c'est une stratégie pour éviter la contagion du direct.",
      forces: [
        "Distance utile en période de bruit",
        "Lecture des dynamiques collectives",
        "Patience face à la surenchère",
      ],
      tip: "Fixez un délai court (20–30 min) avant tout commentaire public sur une annonce choc.",
    },
    acteur: {
      name: "Acteur pratique",
      blurb: "Vous traduisez l'annonce en impact concret — ou vous passez.",
      body: "Une déclaration choc à l'antenne ne reste pas abstraite : vous demandez vite si elle change une décision, un déplacement, une conversation. Le spectacle compte moins que la conséquence réelle.",
      forces: [
        "Tri rapide signal / distraction",
        "Orientation action sous flux d'info",
        "Économie d'attention",
      ],
      tip: "Posez la question : « Qu'est-ce que je change demain ? » Si la réponse est « rien », rangez l'alerte.",
    },
  };

  var QUESTIONS = [
    {
      text: "Ce qui s'est passé hier soir à l'antenne « a choqué toute la France », dit-on. Votre tout premier geste ?",
      options: [
        { i: "1", profile: "chercheur", label: "Retrouver le passage original et le déroulé exact." },
        { i: "2", profile: "verificateur", label: "Interroger l'ampleur de « toute la France »." },
        { i: "3", profile: "observateur", label: "Observer d'abord les réactions autour de vous." },
        { i: "4", profile: "acteur", label: "Vérifier si cela change quelque chose pour vous aujourd'hui." },
      ],
    },
    {
      text: "On vous presse de réagir tout de suite à cette déclaration choc. Vous…",
      options: [
        { i: "1", profile: "chercheur", label: "Demandez les faits bruts avant tout avis." },
        { i: "2", profile: "verificateur", label: "Relevez ce qui est affirmé sans preuve." },
        { i: "3", profile: "observateur", label: "Préférez écouter encore un moment." },
        { i: "4", profile: "acteur", label: "Répondez surtout sous l'angle des conséquences utiles." },
      ],
    },
    {
      text: "Le plateau martèle : « Personne n'en revient. » Qu'est-ce qui vous accroche ?",
      options: [
        { i: "1", profile: "chercheur", label: "L'absence d'éléments concrets sur ce qui s'est passé." },
        { i: "2", profile: "verificateur", label: "La généralisation absolue (« personne »)." },
        { i: "3", profile: "observateur", label: "La pression émotionnelle du direct." },
        { i: "4", profile: "acteur", label: "Savoir s'il y a une suite pratique à en tirer." },
      ],
    },
    {
      text: "Le lendemain, tout le monde parle encore de « la déclaration d'hier ». Vous…",
      options: [
        { i: "1", profile: "chercheur", label: "Comparez plusieurs sources pour croiser les versions." },
        { i: "2", profile: "verificateur", label: "Vérifiez si la formulation a été adoucie ou amplifiée." },
        { i: "3", profile: "observateur", label: "Mesurez si l'emballement a déjà baissé." },
        { i: "4", profile: "acteur", label: "Décidez vite si le sujet mérite encore votre attention." },
      ],
    },
    {
      text: "Face à une info censée avoir choqué toute la France, vous vous sentez le plus utile lorsque vous…",
      options: [
        { i: "1", profile: "chercheur", label: "Remettez de l'ordre chronologique et factuel." },
        { i: "2", profile: "verificateur", label: "Clarifiez ce que la phrase exagère." },
        { i: "3", profile: "observateur", label: "Calmez le débat autour de vous." },
        { i: "4", profile: "acteur", label: "Proposez la prochaine étape concrète." },
      ],
    },
  ];

  function score(answers) {
    var t = { chercheur: 0, verificateur: 0, observateur: 0, acteur: 0 };
    answers.forEach(function (id) {
      if (t[id] !== undefined) t[id] += 1;
    });
    var order = ["chercheur", "verificateur", "observateur", "acteur"];
    var winner = order[0];
    var max = -1;
    order.forEach(function (id) {
      if (t[id] > max) {
        max = t[id];
        winner = id;
      }
    });
    return winner;
  }

  function save(id) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ id: id, at: Date.now() }));
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
    var qEl = $("q");
    var opts = $("opts");

    function paint() {
      var q = QUESTIONS[state.i];
      var pct = Math.round((state.i / QUESTIONS.length) * 100);
      if (bar) bar.style.width = pct + "%";
      if (label) label.textContent = "Question " + (state.i + 1) + " / " + QUESTIONS.length;
      qEl.classList.remove("q");
      void qEl.offsetWidth;
      qEl.classList.add("q");
      qEl.textContent = q.text;
      opts.innerHTML = "";
      q.options.forEach(function (o) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "opt";
        b.innerHTML = '<span class="opt__i">' + o.i + ".</span> " + o.label;
        b.addEventListener("click", function () {
          state.answers.push(o.profile);
          state.i += 1;
          if (state.i >= QUESTIONS.length) {
            if (bar) bar.style.width = "100%";
            save(score(state.answers));
            location.href = "resultat.html";
          } else {
            paint();
          }
        });
        opts.appendChild(b);
      });
    }
    paint();
  }

  function runResult() {
    var root = $("result-app");
    if (!root) return;
    var stored = load();
    var p = stored && PROFILES[stored.id] ? PROFILES[stored.id] : null;
    if (!p) {
      root.innerHTML =
        '<h1>Résultat indisponible</h1><p>Relancez les cinq questions pour obtenir votre lecture.</p><div class="actions"><a class="btn btn--wine" href="quiz.html">Commencer le quiz</a></div>';
      return;
    }
    var forces = p.forces.map(function (f) { return "<li>" + f + "</li>"; }).join("");
    root.innerHTML =
      '<p class="result-kicker">Votre lecture</p><h1>' +
      p.name +
      "</h1><p>" +
      p.blurb +
      '</p><article class="quiz-box" style="margin-top:1.5rem"><h2>Ce que cela révèle</h2><p>' +
      p.body +
      '</p><h3 class="em">Vos forces</h3><ul class="forces">' +
      forces +
      '</ul><div class="tip"><strong>Piste concrète</strong><p style="margin:0;color:var(--ink-2)">' +
      p.tip +
      '</p></div><p class="disclaimer"><strong style="color:var(--ink-2)">Avertissement</strong> — Ce quiz est proposé à titre purement ludique. Il ne constitue ni un diagnostic, ni un conseil professionnel, ni une évaluation scientifique.</p><div class="actions"><a class="btn btn--wine" href="quiz.html">Refaire le quiz</a><a class="btn btn--ghost" href="index.html">Retour</a></div></article>';
  }

  document.addEventListener("DOMContentLoaded", function () {
    runQuiz();
    runResult();
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = String(new Date().getFullYear());
  });
})();
