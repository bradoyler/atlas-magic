# Atlas-Magic :sparkles:

This tool will:  
-> download a shp file from CDN  
-> apply an optional filter  
-> converts to topojson  
-> simplify geometries while preserving topology

### Run it
```
npx atlas-magic > newtopojson.json
```

Watch the magic happen...

## Command Line Reference

<a name="atlas-magic" href="#atlas-magic">#</a><b>atlas-magic</b> &lt;<i>command</i>&gt; [<i>options…</i>]  [`<>`](https://github.com/bradoyler/atlas-magic/blob/master/bin/atlas-magic.js "Source")

where __&lt;command&gt;__ is:  
`us-counties, us-cities`

__[options...]__

| key | default | example
|--------|--------|---------
| listfile= |  | `myFIPScodes.csv` (used for filtering)
| outputfile= |  | `path/to/output.json`
| filterkey= | `FIPS` | &nbsp;
| simplify= | `0.006` | &nbsp;

