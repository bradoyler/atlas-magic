# Atlas-Magic :sparkles:

This tool will:  
-> download a shp file from CDN  
-> apply an optional filter  
-> converts to topojson  
-> simplify geometries while preserving topology

### Run it
```
npx atlas-magic us-rivers > newtopojson.json
```

Watch the magic happen...

## Command Line Reference

<a name="atlas-magic" href="#atlas-magic">#</a><b>atlas-magic</b> &lt;<i>command</i>&gt; [<i>options…</i>]  [`<>`](https://github.com/bradoyler/atlas-magic/blob/master/bin/atlas-magic.js "Source")

where __&lt;command&gt;__ is:  
`us-counties, us-cities`

__[options...]__

| key | default | example
|--------|--------|---------
| --listfile |  | `myFIPScodes.csv` (used for filtering)
| --output |  | `path/to/output.json`
| --filterkey | `FIPS` | &nbsp;
| --max | `100000` | for population (when applied)
| --simplify | `0.006` | &nbsp;


### Examples

##### US Cities with population over 250k
`$ atlas-magic us-cities --max 250000 --output cities_over_250k.json`

##### US Counties filtered by a newline delimited list
`$ atlas-magic us-counties --listfile fips_codes.csv --output my-us-counties.json`

##### US Rivers
`$ atlas-magic us-rivers --output us-rivers.json`
