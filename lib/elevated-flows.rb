module ElevatedFlows; end

def ElevatedFlow(&block)
  puts 'hello there'

  block.call
end