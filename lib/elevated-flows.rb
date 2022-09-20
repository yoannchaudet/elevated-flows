require "singleton"

module ElevatedFlows; end

class ElevatedFlows::Description
  include Singleton

  def initialize
    # nothing
  end

  def hello(&block)
    puts 'hello'
  end
end

def ElevatedFlow(&block)
  puts 'hello from the top level'
  ElevatedFlows::Description.instance.instance_eval(&block)
end