import React from 'react';
import Post from 'gatsby-theme-blorg/src/components/post'
const unified = require('unified');
const html = require('rehype-stringify')
const math = require('rehype-math')
const reparse = require('rehype-parse')
const katex = require('rehype-katex')

const latex = unified()
  .use(reparse, {fragment: true})
  .use(math)
  .use(katex)
  .use(html);

const process = async post => {
  const {title, html} = post.orgPost;

  const {orgPost} = Object.assign({}, post);
  const onProcess = (ref: keyof typeof orgPost) => (err, file) => {
    if (err) {
      console.err(err);
      return;
    }
    orgPost[ref] = String(file);
  }

  await Promise.all([
    latex.process(title, onProcess('title')),
    latex.process(html, onProcess('html'))
  ]);

  return {orgPost};
}

const WrappedPost = ({data: oldData}) => {
  const [data, setData] = React.useState(oldData);

  React.useEffect(() => {
    let shouldRun = true;

    process(data).then(newData => {
      if (shouldRun) {
        setData(newData);
      }
    });

    return () => {shouldRun = false};
  }, [oldData]);

  return <Post data={data} />;
}

export default WrappedPost;
