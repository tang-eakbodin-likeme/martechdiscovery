<?xml version="1.0" encoding="UTF-8"?>
<!-- Browser view of sitemap.xml as a tree: root, then one branch per language with each section and its pages.
     Search engines read sitemap.xml itself; this file only changes how a browser shows it. -->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="sm">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:variable name="all" select="/sm:urlset/sm:url" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>XML Sitemap — MarTech Discovery Platform</title>
        <style>
          :root{color-scheme:light;--ink:#172b4d;--muted:#60748b;--line:#d8e5f2;--blue:#1d4ed8;--pale:#f2f8ff;--green:#10a878;--branch:#b9cbe0}
          *{box-sizing:border-box}body{margin:0;background:var(--pale);color:var(--ink);font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
          header{padding:34px 22px 26px;background:linear-gradient(120deg,#fff,#eaf6ff);border-bottom:1px solid var(--line)}
          .wrap{width:min(1120px,100% - 36px);margin:auto}
          .brand{display:flex;align-items:center;gap:12px;color:var(--ink);text-decoration:none;font-size:13px;letter-spacing:.1em;font-weight:700}
          .mark{display:grid;place-items:center;width:38px;height:38px;border:1px solid #c9ddf5;border-radius:11px;color:var(--blue);font-weight:800;letter-spacing:0;background:white}
          h1{font-size:clamp(27px,5vw,42px);letter-spacing:-.04em;line-height:1.15;margin:28px 0 8px}
          .intro{margin:0;color:var(--muted);max-width:740px}
          .summary{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-top:19px}
          .pill{display:inline-flex;align-items:center;gap:7px;padding:6px 11px;border:1px solid var(--line);border-radius:999px;background:#fff;color:var(--muted);font-size:13px}
          .dot{width:8px;height:8px;border-radius:50%;background:var(--green)}
          main{padding:27px 0 54px}
          .card{background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 8px 28px rgba(27,61,105,.06);padding:20px 22px}
          /* tree: each level indented, with a vertical branch line and a short tick per item */
          ul.tree{list-style:none;margin:0;padding:0}
          ul.tree ul{list-style:none;margin:4px 0 4px 14px;padding:0 0 0 18px;border-left:1px solid var(--branch)}
          ul.tree ul>li{position:relative}
          ul.tree ul>li::before{content:"";position:absolute;left:-18px;top:19px;width:14px;border-top:1px solid var(--branch)}
          .node{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px;padding:7px 0}
          .label{font-weight:600}
          .count{font-size:12px;color:#52677f;background:#eef4fb;border-radius:999px;padding:1px 8px}
          a.url{color:var(--blue);text-decoration:none;font-size:14px;overflow-wrap:anywhere}
          a.url:hover{text-decoration:underline}
          .lang-head{font-size:18px}
          details>summary{cursor:pointer;list-style:none}
          details>summary::-webkit-details-marker{display:none}
          details>summary .label::before{content:"▸";display:inline-block;width:14px;color:var(--muted);transition:transform .15s}
          details[open]>summary .label::before{transform:rotate(90deg)}
          .slug{font-size:14px;color:var(--ink)}
          .meta{font-size:12px;color:var(--muted)}
          footer{padding:19px 0;color:var(--muted);font-size:13px}
          .footer-row{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}.footer-row a{color:var(--blue)}
          @media(max-width:640px){header{padding-top:25px}main{padding-top:17px}.wrap{width:min(100% - 24px,1120px)}.card{padding:14px}ul.tree ul{margin-left:6px;padding-left:14px}ul.tree ul>li::before{left:-14px;width:10px}}
        </style>
      </head>
      <body>
        <header>
          <div class="wrap">
            <a class="brand" href="/th/"><span class="mark">MD</span><span>MARTECH<br />DISCOVERY</span></a>
            <h1>XML Sitemap</h1>
            <p class="intro">The public pages of MarTech Discovery as a tree: one branch per language, then each section and its pages. Search engines read this same file as standard XML.</p>
            <div class="summary">
              <span class="pill"><span class="dot"></span> Sitemap is available</span>
              <span class="pill"><xsl:value-of select="count($all)" /> URLs</span>
              <span class="pill">ไทย · <xsl:value-of select="count($all[contains(sm:loc,'/th/')])" /></span>
              <span class="pill">English · <xsl:value-of select="count($all[contains(sm:loc,'/en/')])" /></span>
            </div>
          </div>
        </header>
        <main class="wrap">
          <div class="card">
            <ul class="tree">
              <li>
                <div class="node"><span class="label">Site root</span>
                  <xsl:for-each select="$all[not(contains(sm:loc,'/th/')) and not(contains(sm:loc,'/en/'))]">
                    <a class="url" href="{sm:loc}"><xsl:value-of select="sm:loc" /></a>
                  </xsl:for-each>
                  <span class="meta">opens the Thai site</span>
                </div>
                <ul>
                  <xsl:call-template name="language"><xsl:with-param name="code" select="'th'" /><xsl:with-param name="name" select="'ไทย · Thai'" /></xsl:call-template>
                  <xsl:call-template name="language"><xsl:with-param name="code" select="'en'" /><xsl:with-param name="name" select="'English'" /></xsl:call-template>
                </ul>
              </li>
            </ul>
          </div>
          <footer><div class="footer-row"><span>Generated from the platform’s public route registry. Each page also lists its other-language versions.</span><span>Machine-readable version: <a href="/sitemap.xml">sitemap.xml</a></span></div></footer>
        </main>
      </body>
    </html>
  </xsl:template>

  <!-- one language branch: home, then each section -->
  <xsl:template name="language">
    <xsl:param name="code" />
    <xsl:param name="name" />
    <xsl:variable name="mine" select="$all[contains(sm:loc,concat('/',$code,'/'))]" />
    <li>
      <div class="node"><span class="label lang-head"><xsl:value-of select="$name" /></span><span class="count"><xsl:value-of select="count($mine)" /> pages</span></div>
      <ul>
        <xsl:call-template name="page"><xsl:with-param name="code" select="$code" /><xsl:with-param name="suffix" select="''" /><xsl:with-param name="label" select="'Home'" /></xsl:call-template>
        <xsl:call-template name="group"><xsl:with-param name="code" select="$code" /><xsl:with-param name="section" select="'categories/'" /><xsl:with-param name="label" select="'Categories'" /><xsl:with-param name="open" select="true()" /></xsl:call-template>
        <xsl:call-template name="page"><xsl:with-param name="code" select="$code" /><xsl:with-param name="suffix" select="'tools/'" /><xsl:with-param name="label" select="'Explore tools (directory)'" /></xsl:call-template>
        <xsl:call-template name="group"><xsl:with-param name="code" select="$code" /><xsl:with-param name="section" select="'providers/'" /><xsl:with-param name="label" select="'Vendor profiles'" /><xsl:with-param name="open" select="false()" /></xsl:call-template>
        <xsl:call-template name="group"><xsl:with-param name="code" select="$code" /><xsl:with-param name="section" select="'buyer-guide/'" /><xsl:with-param name="label" select="'Buyer Guide'" /><xsl:with-param name="open" select="true()" /></xsl:call-template>
        <xsl:call-template name="page"><xsl:with-param name="code" select="$code" /><xsl:with-param name="suffix" select="'for-providers/'" /><xsl:with-param name="label" select="'For providers'" /></xsl:call-template>
        <xsl:call-template name="page"><xsl:with-param name="code" select="$code" /><xsl:with-param name="suffix" select="'editorial-policy/'" /><xsl:with-param name="label" select="'Editorial policy'" /></xsl:call-template>
      </ul>
    </li>
  </xsl:template>

  <!-- a single page: the URL that ends with /{code}/{suffix} -->
  <xsl:template name="page">
    <xsl:param name="code" />
    <xsl:param name="suffix" />
    <xsl:param name="label" />
    <xsl:variable name="end" select="concat('/',$code,'/',$suffix)" />
    <xsl:for-each select="$all[substring(sm:loc, string-length(sm:loc) - string-length($end) + 1) = $end]">
      <li><div class="node"><span class="label"><xsl:value-of select="$label" /></span><a class="url" href="{sm:loc}"><xsl:value-of select="sm:loc" /></a></div></li>
    </xsl:for-each>
  </xsl:template>

  <!-- a section page with the pages under it, folded open or closed -->
  <xsl:template name="group">
    <xsl:param name="code" />
    <xsl:param name="section" />
    <xsl:param name="label" />
    <xsl:param name="open" />
    <xsl:variable name="prefix" select="concat('/',$code,'/',$section)" />
    <xsl:variable name="index" select="$all[substring(sm:loc, string-length(sm:loc) - string-length($prefix) + 1) = $prefix]" />
    <xsl:variable name="kids" select="$all[contains(sm:loc,$prefix) and string-length(substring-after(sm:loc,$prefix)) &gt; 0]" />
    <li>
      <details>
        <xsl:if test="$open"><xsl:attribute name="open">open</xsl:attribute></xsl:if>
        <summary class="node">
          <span class="label"><xsl:value-of select="$label" /></span>
          <span class="count"><xsl:value-of select="count($kids)" /><xsl:choose><xsl:when test="count($kids) = 1"> page</xsl:when><xsl:otherwise> pages</xsl:otherwise></xsl:choose></span>
          <xsl:for-each select="$index"><a class="url" href="{sm:loc}"><xsl:value-of select="sm:loc" /></a></xsl:for-each>
        </summary>
        <ul>
          <xsl:for-each select="$kids">
            <xsl:sort select="sm:loc" />
            <li><div class="node"><a class="url slug" href="{sm:loc}"><xsl:value-of select="substring-before(substring-after(sm:loc,$prefix),'/')" /></a></div></li>
          </xsl:for-each>
        </ul>
      </details>
    </li>
  </xsl:template>
</xsl:stylesheet>
