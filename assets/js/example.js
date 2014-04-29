
$("input[name=navi]").on("change", function(e){
    var name = $(e.target).val();
    $(".page").removeClass("active")
    .filter("#" + name).addClass("active").animate("opacity")
});

$(".widget-pages").addClass("animation");

$(".widget-console .console").text($("#dummy-console").html());