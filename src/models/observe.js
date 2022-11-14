
import InsularObserver from 'insular-observer'


const observe =
  InsularObserver (IntersectionObserver, {threshold: [0.1, 0.9], rootMargin: '0px'})


export default observe
