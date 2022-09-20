Gem::Specification.new do |s|
  s.name        = "elevated-flows"
  s.version     = "0.0.0"
  s.summary     = "An elevated way of describing GitHub workflows"
  s.authors     = ["Yoann Chaudet"]
  s.email       = "yoannchaudet@github.com"
  s.files       = ["lib/elevated-flows.rb"]

  # Dependencies
  s.add_dependency("octokit", "~> 5.0")
end