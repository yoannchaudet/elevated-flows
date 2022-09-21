# frozen_string_literal: true

module ElevatedFlows
  def @@blank_value = Object.new

  autoload :FlowParser, 'elevated-flows/flow_parser'
  autoload :ConfigParser, 'elevated-flows/config_parser'
end
