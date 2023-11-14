$(function () {
  let btn = $("#download");

  btn.click(function () {
    $.getJSON(
      "https://akademia108.pl/kurs-front-end/ajax/1-pobierz-dane-programisty.php"
    ).done(function (data) {
      let name = data.imie;
      let surname = data.nazwisko;
      let zawod = data.zawod;
      let firma = data.firma;

      btn.after("<div id='dane-programisty'></div>");

      $("#dane-programisty").append("<p></p>");

      $("p").text(name + " " + surname + " " + zawod + " " + firma);
    });
  });
});

//
