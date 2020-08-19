const fs = require('fs')
const puppeteer = require('puppeteer')
const url = process.env.URL
const readme = process.env.FILE

;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const response = await page.goto(url, { waitUntil: 'load', timeout: 10000 })

  if (response.status() < 400) {
    // let page fully load
    await page.waitForNavigation({
      waitUntil: 'networkidle0',
      timeout: 10000,
    })

    // get resources
    const resources = await page.evaluate(() => {
      let res = Array.from(
        document.getElementsByTagName('code'),
        e => e.innerText
      )
        .filter(x => x.includes('::'))
        .sort()

      return [...new Set(res)]
    })

    // browser is done
    await browser.close()

    if (resources.length > 0) {
      // format resource list
      const contents = `# AWS Config Resource Watcher\n\n${resources
        .map(r => {
          return `- [x] ${r}`
        })
        .join('\n')}\n\nFound ${resources.length} resources`

      // write readme.md
      fs.writeFile(readme, contents, err => {
        if (err) return console.log(err)
        console.log(resources.join('\n'))
        console.log(`${resources.length} supported resources`)
      })
    }
  } else {
    console.log('Nothing to do.')
  }
})()
