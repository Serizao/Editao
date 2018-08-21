function myMarkdownHtml(value){
  //titre
  value = value.replace(/(<div>####### (.*)<\/div>)|(^###### (.*))/gmi,'<h6> $2 $4</h6>');
  value = value.replace(/(<div>###### (.*)<\/div>)|(^##### (.*))/gmi,'<h5> $2 $4</h5>');
  value = value.replace(/(<div>##### (.*)<\/div>)|(^#### (.*))/gmi,'<h4> $2 $4</h4>');
  value = value.replace(/(<div>#### (.*)<\/div>)|(^### (.*))/gmi,'<h3> $2 $4</h3>');
  value = value.replace(/(<div>## (.*)<\/div>)|(^## (.*))/gmi,'<h2> $2 $4</h2>');
  value = value.replace(/(<div># (.*)<\/div>)|(^# (.*))/gmi,'<h1> $2 $4</h1>');
  //image
  value = value.replace(/\!\[(.*)\]\((.*)\)/gmi,'<img alt="$1" src="$2"/>')
  return value;
}
