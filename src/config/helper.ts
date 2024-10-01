type envVars = { [key: string]: string }

export const getEnvVars = (envVarNames: string[]): envVars => {
  const evs: envVars = {}

  envVarNames.forEach((name) => {
    const value = process.env[name]
    if (!value) {
      throw new Error(`Missing or invalid environment variable: ${name}`)
    }
    evs[name] = value
  })

  return evs
}
