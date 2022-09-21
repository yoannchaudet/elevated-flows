# frozen_string_literal: true

module ElevatedFlows
  # Main parser
  class FlowParser

    def initialize
      @config = nil
    end

    def parse(flow_file)
      flow_file_content = File.read(flow_file)
      instance_eval(flow_file_content)
    end

    def config(&block)
      ConfigParser.instance_eval(&block)
    end

    def main(&block)
      instance_eval(&block)
    end
  end
end
